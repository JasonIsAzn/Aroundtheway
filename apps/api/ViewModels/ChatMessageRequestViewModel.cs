using System.ComponentModel.DataAnnotations;

namespace Aroundtheway.Api.ViewModels;

public class ChatMessageRequestViewModel
{
    [Required(ErrorMessage = "Message is required")]
    [StringLength(1000, ErrorMessage = "Message cannot exceed 1000 characters")]
    public string Message { get; set; } = string.Empty;
}