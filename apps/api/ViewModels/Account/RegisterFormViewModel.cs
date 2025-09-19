using System.ComponentModel.DataAnnotations;
using Aroundtheway.Api.Validation;

namespace Aroundtheway.Api.ViewModels.Account;

public class RegisterFormViewModel
{
    [Required(ErrorMessage = "Please enter your email.")]
    [EmailAddress(ErrorMessage = "Please enter a valid email.")]
    [UniqueEmail(ErrorMessage = "That email is already in use.")]
    public string Email { get; set; } = string.Empty;

    [DataType(DataType.Password)]
    [Required(ErrorMessage = "Please enter your password.")]
    [MinLength(8, ErrorMessage = "Password must be at least 8 characters long.")]
    [RegularExpression(
        @"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$",
        ErrorMessage = "Password must be at least 8 characters long and contain one uppercase letter, one lowercase letter, and one number."
    )]
    public string Password { get; set; } = string.Empty;

    [DataType(DataType.Password)]
    [Required(ErrorMessage = "Please confirm your password.")]
    [Compare("Password", ErrorMessage = "Passwords do not match.")]
    public string ConfirmPassword { get; set; } = string.Empty;
}