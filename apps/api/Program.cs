using Microsoft.EntityFrameworkCore;
using Aroundtheway.Api.Data;
using MySqlConnector;
using Aroundtheway.Api.Services;
using OpenAI.Chat;
using Amazon.S3;
using Amazon;
using Microsoft.AspNetCore.Authentication.Cookies;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllersWithViews();

builder.Services.AddDistributedMemoryCache();
builder.Services.AddSession(options =>
{
    options.Cookie.Name = "Aroundtheway.Session";
    options.Cookie.HttpOnly = true;
    options.Cookie.SameSite = SameSiteMode.Lax;
    options.Cookie.SecurePolicy = CookieSecurePolicy.SameAsRequest;
});
builder.Services.AddScoped<IPasswordService, BcryptPasswordService>();

// Configure OpenAI ChatClient
var openAIApiKey = builder.Configuration["OpenAI:ApiKey"] ?? Environment.GetEnvironmentVariable("OPENAI_API_KEY");
if (string.IsNullOrEmpty(openAIApiKey))
{
    throw new InvalidOperationException("OpenAI API key is not configured. Set OPENAI_API_KEY environment variable or add OpenAI:ApiKey to appsettings.json");
}
builder.Services.AddSingleton(new ChatClient("gpt-4", openAIApiKey));

builder.Services.AddAuthentication(CookieAuthenticationDefaults.AuthenticationScheme)
    .AddCookie(o =>
    {
        o.LoginPath = "/account/login";
        o.AccessDeniedPath = "/account/access-denied";
        o.Cookie.Name = "Aroundtheway.Auth";
        o.Cookie.SameSite = SameSiteMode.Lax;
        o.Cookie.SecurePolicy = CookieSecurePolicy.Always;
    });

builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("AdminOnly", p => p.RequireClaim("role", "admin"));
});

builder.Services.AddSingleton<Aroundtheway.Api.Services.StripeService>();

var connectionString = builder.Configuration.GetConnectionString("defaultConnection");
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseMySql(connectionString, ServerVersion.AutoDetect(connectionString))
);

// Configure AWS S3 for Supabase Storage
var awsConfig = new AmazonS3Config
{
    ServiceURL = builder.Configuration["AWS:ServiceURL"],
    ForcePathStyle = true
};

builder.Services.AddScoped<IAmazonS3>(provider =>
{
    var accessKey = builder.Configuration["AWS:AccessKey"] ?? "";
    var secretKey = builder.Configuration["AWS:SecretKey"] ?? "";

    if (string.IsNullOrEmpty(accessKey) || string.IsNullOrEmpty(secretKey))
    {
        throw new InvalidOperationException("AWS AccessKey and SecretKey must be configured");
    }

    return new AmazonS3Client(accessKey, secretKey, awsConfig);
});

builder.Services.AddScoped<Supabase.Client>(provider =>
{
    var configuration = provider.GetRequiredService<IConfiguration>();
    var url = configuration["Supabase:Url"];
    var key = configuration["Supabase:Key"];

    var options = new Supabase.SupabaseOptions
    {
        AutoConnectRealtime = false
    };

    return new Supabase.Client(url, key, options);
});

builder.Services.AddScoped<IImageStorageService, S3ImageStorageService>();

var app = builder.Build();

if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Home/Error");
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseStaticFiles();

app.UseRouting();


app.UseAuthentication();
app.UseAuthorization();

app.UseSession();

app.MapControllers();

app.MapGet(
    "/dbping",
    async () =>
    {
        var cs = builder.Configuration.GetConnectionString("defaultConnection");
        await using var conn = new MySqlConnection(cs);
        await conn.OpenAsync();
        using var cmd = new MySqlCommand("SELECT 1", conn);
        var result = (long?)await cmd.ExecuteScalarAsync();
        return result == 1 ? "db-ok" : "db-fail";
    }
);

app.MapGet(
    "/s3-ping",
    async (IAmazonS3 s3Client) =>
    {
        try
        {
            // Try to list objects in the bucket to test connection
            var request = new Amazon.S3.Model.ListObjectsV2Request
            {
                BucketName = "product-images",
                MaxKeys = 1
            };
            var response = await s3Client.ListObjectsV2Async(request);
            return $"s3-ok: bucket accessible, {response.S3Objects.Count} objects sampled";
        }
        catch (Exception ex)
        {
            return $"s3-fail: {ex.Message}";
        }
    }
);

app.MapControllerRoute(name: "default", pattern: "{controller=Home}/{action=Index}/{id?}");

app.Run();
