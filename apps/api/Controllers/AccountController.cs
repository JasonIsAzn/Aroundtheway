using Aroundtheway.Api.Data;
using Aroundtheway.Api.Services;
using Aroundtheway.Api.ViewModels.Account;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Aroundtheway.Api.Models;

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
    public IActionResult Login(string? error, string? message)
    {
        ViewData["Title"] = "Login";
        ViewData["Message"] = message;
        return View(new LoginFormViewModel { Error = error });
    }

    [HttpGet("logout")]
    public IActionResult Logout()
    {
        ViewData["Title"] = "Logout";
        return View();
    }

    [HttpGet("access-denied")]
    public IActionResult AccessDenied()
    {
        return View();
    }

    [HttpGet("register")]
    public IActionResult Register(string? error)
    {
        ViewData["Title"] = "Register";
        return View(new RegisterFormViewModel { Error = error });
    }

    [HttpPost("register")]
    public async Task<IActionResult> RegisterPost([FromForm] RegisterFormViewModel vm)
    {
        if (!ModelState.IsValid)
        {
            return View("Register", vm);
        }

        var email = (vm.Email ?? "").Trim().ToLowerInvariant();
        var password = (vm.Password ?? "").Trim();

        if (password != vm.ConfirmPassword)
        {
            ModelState.AddModelError("", "Passwords do not match.");
            return View("Register", vm);
        }

        if (await _context.Users.AsNoTracking().AnyAsync(u => u.Email == email))
        {
            ModelState.AddModelError("", "Email already in use.");
            return View("Register", vm);
        }

        try
        {
            var hashed = _passwords.Hash(password);
            var user = new User { Email = email, PasswordHash = hashed };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            return RedirectToAction("Login", new { message = "Account created successfully. Please log in." });
        }
        catch (Exception)
        {
            ModelState.AddModelError("", "An error occurred while creating your account.");
            return View("Register", vm);
        }
    }
}