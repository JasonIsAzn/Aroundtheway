using System.ComponentModel.DataAnnotations;

namespace Aroundtheway.Api.Dtos.Auth;

public record class RegisterRequest
{
    [Required(ErrorMessage = "Please enter your email.")]
    [EmailAddress(ErrorMessage = "Please enter a valid email.")]
    public string Email { get; init; } = string.Empty;

    [Required(ErrorMessage = "Please enter your password.")]
    [MinLength(8, ErrorMessage = "Password must be at least 8 characters.")]
    [RegularExpression(@"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$",
        ErrorMessage = "Password must contain upper, lower, and a number.")]
    public string Password { get; init; } = string.Empty;
}