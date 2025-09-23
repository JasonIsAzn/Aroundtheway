using Aroundtheway.Api.Models;

namespace Aroundtheway.Api.ViewModels.Admin;

public class UsersViewModel
{
    public IEnumerable<User> Users { get; set; } = new List<User>();
}