using Microsoft.EntityFrameworkCore;
using Aroundtheway.Api.Models;
using System.Text.Json;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;

namespace Aroundtheway.Api.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }
    public DbSet<User> Users { get; set; }
    public DbSet<ChatMessage> ChatMessages { get; set; }
    public DbSet<Post> Posts { get; set; } = null!;


    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Users
        modelBuilder.Entity<User>()
            .HasIndex(u => u.Email)
            .IsUnique();

        // Configure ChatMessage relationships
        modelBuilder.Entity<ChatMessage>()
            .HasOne(c => c.User)
            .WithMany()
            .HasForeignKey(c => c.UserId)
            .OnDelete(DeleteBehavior.Cascade);


        // Posts
        // 1) JSON conversion for ImageUrls (List<string> -> string column)
        var jsonOptions = new JsonSerializerOptions { WriteIndented = false };
        var listToJsonConverter = new ValueConverter<List<string>, string>(
            v => JsonSerializer.Serialize(v ?? new List<string>(), jsonOptions),
            v => string.IsNullOrWhiteSpace(v)
                    ? new List<string>()
                    : (JsonSerializer.Deserialize<List<string>>(v, jsonOptions) ?? new List<string>()));

        modelBuilder.Entity<Post>()
            .Property(p => p.ImageUrls)
            .HasConversion(listToJsonConverter)
            .HasColumnType("LONGTEXT");

        // 2) Unique index on ProductId
        modelBuilder.Entity<Post>()
            .HasIndex(p => p.ProductId)
            .IsUnique();
    }
}