using Microsoft.EntityFrameworkCore;
using Aroundtheway.Api.Data;
using MySqlConnector;
using Aroundtheway.Api.Services;
using OpenAI.Chat;

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

var connectionString = builder.Configuration.GetConnectionString("defaultConnection");
builder.Services.AddDbContext<AppDbContext>(options => options.UseMySql(connectionString, ServerVersion.AutoDetect(connectionString)));

var app = builder.Build();

if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Home/Error");
    app.UseHsts();
}

app.UseHttpsRedirection();

app.UseRouting();

app.UseSession();

app.UseAuthorization();

app.MapControllers();

app.UseStaticFiles();


app.MapGet("/dbping", async () =>
{
    var cs = builder.Configuration.GetConnectionString("defaultConnection");
    await using var conn = new MySqlConnection(cs);
    await conn.OpenAsync();
    using var cmd = new MySqlCommand("SELECT 1", conn);
    var result = (long?)await cmd.ExecuteScalarAsync();
    return result == 1 ? "db-ok" : "db-fail";
});

app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Home}/{action=Index}/{id?}");


app.Run();
