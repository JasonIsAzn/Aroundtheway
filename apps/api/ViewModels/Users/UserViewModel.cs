
using Aroundtheway.Api.Models;

namespace Aroundtheway.Api.ViewModels.Users;

public class UserViewModel
{
    public int Id { get; set; }
    public string Email { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public bool IsAdmin { get; set; }
    public string Address { get; set; } = string.Empty; // TODO Improve typing
    public string CreditCard { get; set; } = string.Empty; // TODO encrypt this
}