namespace Aroundtheway.Api.ViewModels.Post;

public class PostRowViewModel
{
    public int Id { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public string? FirstImageUrl { get; set; }
    public int ImageCount { get; set; }

}