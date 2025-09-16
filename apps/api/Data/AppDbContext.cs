using Microsoft.EntityFrameworkCore;
using Aroundtheway.Api.Models;

namespace Aroundtheway.Api.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }
    public DbSet<User> Users { get; set; }
}