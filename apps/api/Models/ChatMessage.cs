using System;
using System.ComponentModel.DataAnnotations;

namespace Aroundtheway.Api.Models;

public class ChatMessage
{
    [Key]
    public int Id { get; set; }

    [Required]
    public int UserId { get; set; }

    [Required]
    [StringLength(1000)]
    public string UserMessage { get; set; } = string.Empty;

    [Required]
    [StringLength(2000)]
    public string BotResponse { get; set; } = string.Empty;

    [Required]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [Required]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation property
    public User User { get; set; } = null!;
}
