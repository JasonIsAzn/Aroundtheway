using System.ComponentModel.DataAnnotations;

namespace Aroundtheway.Api.Dtos.Auth;

public record RegisterRequest(
    [property: Required(ErrorMessage = "Please enter your email.")]
    [property: EmailAddress(ErrorMessage = "Please enter a valid email.")]
    string Email,

    [property: DataType(DataType.Password)]
    [property: Required(ErrorMessage = "Please enter your password.")]
    [property: MinLength(8, ErrorMessage = "Password must be at least 8 characters long.")]
    [property: RegularExpression(
        @"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$",
        ErrorMessage = "Password must be at least 8 characters long and contain one uppercase letter, one lowercase letter, and one number."
    )]
    string Password
);
