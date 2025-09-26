
using Aroundtheway.Api.Data;
using Aroundtheway.Api.Services;
using Aroundtheway.Api.ViewModels.Account;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Aroundtheway.Api.Controllers;

[Route("account")]
public class AccountController : Controller
{
    private readonly AppDbContext _context;
    private readonly IPasswordService _passwords;

    public AccountController(AppDbContext context, IPasswordService passwords)
    {
        _context = context;
        _passwords = passwords;
    }

    [HttpGet("login")]
    public IActionResult Login(string? error)
    {
        ViewData["Title"] = "Login";
        return View(new LoginFormViewModel { Error = error });
    }

    [HttpGet("logout")]
    public IActionResult Logout()
    {
        ViewData["Title"] = "Logout";
        return View();
    }

    [HttpPost("login")]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> LoginPost(LoginFormViewModel vm)
    {
        if (!ModelState.IsValid)
        {
            return View("Login", vm);
        }

        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == vm.Email.Trim().ToLowerInvariant());

        if (user != null && _passwords.Verify(vm.Password, user.PasswordHash)) // TEMP: Removed admin check for demo
        {
            HttpContext.Session.SetInt32("SessionUserId", user.Id);
            return RedirectToAction("Index", "Home");
        }

        vm.Error = "Invalid email or password, or insufficient permissions.";
        return View("Login", vm);
    }

    [HttpGet("access-denied")]
    public IActionResult AccessDenied()
    {
        return View();
    }
}

