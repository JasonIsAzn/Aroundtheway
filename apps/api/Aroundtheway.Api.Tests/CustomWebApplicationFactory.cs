using System.Linq;
using System.Collections.Generic;
using Aroundtheway.Api.Data;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Configuration;

namespace Aroundtheway.Api.Tests;

public class CustomWebApplicationFactory : WebApplicationFactory<Program>
{
    private SqliteConnection _connection = default!;

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment("Test");

        builder.ConfigureAppConfiguration((_, cfg) =>
        {
            cfg.AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["OpenAI:ApiKey"] = "test",
                ["AWS:AccessKey"] = "test",
                ["AWS:SecretKey"] = "test",
                ["AWS:ServiceURL"] = "http://localhost",
                ["Supabase:Url"] = "http://localhost",
                ["Supabase:Key"] = "test",
                ["ConnectionStrings:defaultConnection"] = "Server=localhost;Database=test;User=test;Password=test"
            });
        });

        builder.ConfigureServices(services =>
        {
            // remove existing AppDbContext registrations
            var toRemove = services
                .Where(d => d.ServiceType == typeof(DbContextOptions<AppDbContext>))
                .ToList();
            foreach (var d in toRemove) services.Remove(d);

            // shared in-memory sqlite
            _connection = new SqliteConnection("DataSource=:memory:");
            _connection.Open();

            services.AddDbContext<AppDbContext>(opts => opts.UseSqlite(_connection));

            // ensure schema
            var sp = services.BuildServiceProvider();
            using var scope = sp.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            db.Database.EnsureCreated();
        });
    }

    protected override void Dispose(bool disposing)
    {
        base.Dispose(disposing);
        if (disposing) _connection?.Dispose();
    }
}
