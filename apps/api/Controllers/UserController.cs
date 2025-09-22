using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

using Aroundtheway.Api.Data;
using Aroundtheway.Api.ViewModels.Users;
using Microsoft.AspNetCore.Authorization;

namespace Aroundtheway.Api.Controllers;

[Route("user")]
[Authorize(Policy = "AdminOnly")]
public class UserController : Controller
{
    private readonly AppDbContext _context;

    public UserController(AppDbContext context)
    {
        _context = context;
    }


    [HttpGet("")]
    public async Task<IActionResult> Index()
    {
        var users = await _context.Users.ToListAsync();

        var vm = new UsersViewModel
        {
            Users = users
        };

        return View(vm);

    }
}