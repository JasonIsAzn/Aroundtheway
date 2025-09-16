using Microsoft.EntityFrameworkCore;
using Aroundtheway.Api.Data;
using MySqlConnector;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllersWithViews();

var connectionString = builder.Configuration.GetConnectionString("defaultConnection");
builder.Services.AddDbContext<AppDbContext>(options => options.UseMySql(connectionString, ServerVersion.AutoDetect(connectionString)));

var app = builder.Build();

// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Home/Error");
    // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseRouting();

app.UseAuthorization();

app.MapStaticAssets();


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
    pattern: "{controller=Home}/{action=Index}/{id?}")
    .WithStaticAssets();


app.Run();
