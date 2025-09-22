namespace Aroundtheway.Api.ViewModels;

public class ChatMessageResponseViewModel
{
    public string Message { get; set; } = string.Empty;
    public DateTime Timestamp { get; set; }
    public int? MessageId { get; set; }
}