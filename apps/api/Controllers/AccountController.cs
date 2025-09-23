
using Aroundtheway.Api.Data;
using Aroundtheway.Api.Services;
using Aroundtheway.Api.ViewModels.Account;
using Aroundtheway.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;

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

    [HttpGet("register")]
    public IActionResult Register(string? message)
    {
        ViewData["Title"] = "Register";
        if (!string.IsNullOrEmpty(message))
            ViewData["Message"] = message;
        return View();
    }

    [HttpGet("login")]
    public IActionResult Login(string? error, string? message)
    {
        ViewData["Title"] = "Login";
        if (!string.IsNullOrEmpty(message))
            ViewData["Message"] = message;
        return View(new LoginFormViewModel { Error = error });
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginFormViewModel model)
    {
        if (!ModelState.IsValid)
            return View(model);

        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == model.Email);
        if (user == null || !_passwords.VerifyPassword(model.Password, user.Password))
        {
            ModelState.AddModelError("", "Invalid email or password");
            return View(model);
        }

        // Create claims for the user
        var claims = new List<Claim>
        {
            new Claim(ClaimTypes.Name, user.Email),
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim("firstName", user.FirstName),
            new Claim("lastName", user.LastName)
        };

        if (user.IsAdmin)
            claims.Add(new Claim("role", "admin"));

        var identity = new ClaimsIdentity(claims, CookieAuthenticationDefaults.AuthenticationScheme);
        var principal = new ClaimsPrincipal(identity);

        await HttpContext.SignInAsync(CookieAuthenticationDefaults.AuthenticationScheme, principal);

        return RedirectToAction("Index", "Home");
    }

    [HttpGet("logout")]
    public IActionResult Logout()
    {
        ViewData["Title"] = "Logout";
        return View();
    }

    [HttpPost("logout")]
    public async Task<IActionResult> LogoutPost()
    {
        await HttpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);
        return RedirectToAction("Index", "Home");    
    }

    [HttpGet("access-denied")]
    public IActionResult AccessDenied()
    {
        return View();
    }
}

