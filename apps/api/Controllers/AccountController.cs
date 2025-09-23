
using Aroundtheway.Api.Data;
using Aroundtheway.Api.Services;
using Aroundtheway.Api.ViewModels.Account;
using Microsoft.AspNetCore.Mvc;

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
}

