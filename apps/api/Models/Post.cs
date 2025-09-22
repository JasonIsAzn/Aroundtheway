using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Aroundtheway.Api.Models;

public class Post
{
    [Key]
    public int Id { get; set; }

    public string ProductName { get; set; } = string.Empty;
    public string Color { get; set; } = string.Empty;
    public double Price { get; set; }

    //inventory stock numbers
    public int NumOfSmall { get; set; }
    public int NumOfMedium { get; set; }
    public int NumOfLarge { get; set; }
    public int NumOfXLarge { get; set; }

    //Image Urls
    public List<string> ImageUrls { get; set; } = new();

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // This is the foreign key for the User who created this post.
    public int UserId { get; set; }

    // This is the navigation property for the User.
    public User? User { get; set; }
}