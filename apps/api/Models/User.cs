using System.ComponentModel.DataAnnotations;

namespace Aroundtheway.Api.Models;

public class User
{
    [Key]
    public int Id { get; set; }
    public string Email { get; set; } = string.Empty;
    public string? PasswordHash { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    public bool IsAdmin { get; set; } = false;
    public string Address { get; set; } = string.Empty; // TODO Improve typing
    public string CreditCard { get; set; } = string.Empty; // TODO encrypt this

    public List<Post> Posts { get; set; } = [];
    public string? GoogleSub { get; set; }
}
