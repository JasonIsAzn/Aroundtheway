using System.ComponentModel.DataAnnotations;

namespace Aroundtheway.Api.Dtos.Auth;

public record class LoginRequest
{
    [Required(ErrorMessage = "Please enter email.")]
    [EmailAddress(ErrorMessage = "Please enter a valid email address.")]
    public string Email { get; init; } = string.Empty;

    [DataType(DataType.Password)]
    [Required(ErrorMessage = "Please enter password.")]
    public string Password { get; init; } = string.Empty;
}
