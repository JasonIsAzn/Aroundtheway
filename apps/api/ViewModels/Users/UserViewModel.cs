
using Aroundtheway.Api.Models;

namespace Aroundtheway.Api.ViewModels.Users;

public class UserViewModel
{
    public int Id;
    public string Email = string.Empty;
    public DateTime CreatedAt;
    public DateTime UpdatedAt;
    public bool IsAdmin;
    public string Address = string.Empty; // TODO Improve typing
    public string CreditCard = string.Empty; // TODO encrypt this
}