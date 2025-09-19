using System.ComponentModel.DataAnnotations;

namespace Aroundtheway.Api.Dtos.Auth;

public record LoginRequest(
    [property: Required(ErrorMessage = "Please enter email.")]
    [property: EmailAddress(ErrorMessage = "Please enter a valid email address.")]
    string Email,

    [property: DataType(DataType.Password)]
    [property: Required(ErrorMessage = "Please enter password.")]
    string Password
);