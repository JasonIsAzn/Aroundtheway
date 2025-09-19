using System.ComponentModel.DataAnnotations;
using Aroundtheway.Api.Data;
using Microsoft.EntityFrameworkCore;

namespace Aroundtheway.Api.Validation;



public class UniqueEmailAttribute : ValidationAttribute
{
    protected override ValidationResult? IsValid(object? value, ValidationContext validationContext)
    {
        var db = validationContext.GetService(typeof(AppDbContext)) as AppDbContext;
        var emailStr = value as string;

        var email = emailStr?.Trim().ToLowerInvariant();
        var exists = db!.Users.AsNoTracking().Any(u => u.Email == email);

        return exists ? new ValidationResult(ErrorMessage) : ValidationResult.Success;
    }
}