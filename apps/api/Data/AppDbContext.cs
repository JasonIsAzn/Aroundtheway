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
    public DbSet<Transaction> Transactions => Set<Transaction>();
    public DbSet<TransactionItem> TransactionItems => Set<TransactionItem>();




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

        modelBuilder.Entity<Post>()
            .HasIndex(p => p.ProductId)
            .IsUnique();

        // Transactions
        modelBuilder.Entity<Transaction>(e =>
        {
            e.Property(t => t.Currency).HasMaxLength(3).IsRequired();
            e.Property(t => t.Address).HasMaxLength(500).IsRequired();

            e.HasOne(t => t.User)
             .WithMany()
             .HasForeignKey(t => t.UserId)
             .OnDelete(DeleteBehavior.SetNull);

            e.HasIndex(t => t.UserId);

            e.HasMany(t => t.Items)
             .WithOne(i => i.Transaction)
             .HasForeignKey(i => i.TransactionId)
             .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<TransactionItem>(e =>
        {
            e.Property(i => i.ProductId).HasMaxLength(128).IsRequired();
            e.Property(i => i.Name).HasMaxLength(200).IsRequired();
            e.Property(i => i.UnitAmountCents).IsRequired();
            e.Property(i => i.Quantity).IsRequired();
        });


    }
}