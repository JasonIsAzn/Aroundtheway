using System.ComponentModel.DataAnnotations;

namespace Aroundtheway.Api.ViewModels.Post;

public class PostFormViewModel
{
    [Required(ErrorMessage = "Post name is required.")]
    public string ProductName { get; set; } = string.Empty;

    [Required(ErrorMessage = "Post color is required.")]
    public string Color { get; set; } = string.Empty;

    [Required(ErrorMessage = "Post price is required.")]
    public string Price { get; set; } = string.Empty;


    [Required(ErrorMessage = "Post amount of small inventory is required.")]
    public string NumOfSmall { get; set; } = string.Empty;
    [Required(ErrorMessage = "Post amount of medium inventory is required.")]
    public string NumOfMedium { get; set; } = string.Empty;

    [Required(ErrorMessage = "Post amount of large inventory is required.")]
    public string NumOfLarge { get; set; } = string.Empty;

    [Required(ErrorMessage = "Post amount of x-large inventory is required.")]
    public string NumOfXLarge { get; set; } = string.Empty;

    [Required(ErrorMessage = "Post image(s) is required")]
    public List<string> ImageUrls { get; set; } = new();


}