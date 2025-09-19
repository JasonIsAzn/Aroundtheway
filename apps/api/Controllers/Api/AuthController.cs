using Aroundtheway.Api.Data;
using Aroundtheway.Api.Dtos.Auth;
using Aroundtheway.Api.Models;
using Aroundtheway.Api.Services;
using Aroundtheway.Api.ViewModels.Account;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Aroundtheway.Api.Controllers.Api;


[ApiController]
[Route("api/auth")]
public class AuthController : Controller
{
    private readonly AppDbContext _context;
    private readonly IPasswordService _passwordService;

    public AuthController(AppDbContext context, IPasswordService passwordService)
    {
        _context = context;
        _passwordService = passwordService;
    }

    [HttpPost("register")]
    [Consumes("application/json")]
    public async Task<IActionResult> RegisterApi(RegisterRequest dto)
    {
        var email = (dto.Email ?? "").Trim().ToLowerInvariant();
        var password = (dto.Password ?? "").Trim();

        var user = await HandleRegister(email, password);

        HttpContext.Session.SetInt32("SessionUserId", user.Id);

        return Created($"/api/users/{user.Id}", new RegisterResponse(user.Id, user.Email, user.IsAdmin));
    }

    [HttpPost("register")]
    [Consumes("application/x-www-form-urlencoded")]
    public async Task<IActionResult> RegisterWeb([FromForm] RegisterFormViewModel vm)
    {
        vm.Email = (vm.Email ?? "").Trim().ToLowerInvariant();
        vm.Password = (vm.Password ?? "").Trim();
        vm.ConfirmPassword = (vm.ConfirmPassword ?? "").Trim();

        if (!ModelState.IsValid) return Problem("Invalid form data");

        var user = await HandleRegister(vm.Email, vm.Password);

        HttpContext.Session.SetInt32("SessionUserId", user.Id);

        return RedirectToAction("Index", "Home");
    }

    private async Task<User> HandleRegister(string email, string password)
    {
        var hashed = _passwordService.Hash(password);
        var user = new User { Email = email, PasswordHash = hashed };

        _context.Users.Add(user);
        await _context.SaveChangesAsync();
        return user;
    }


    [HttpPost("login")]
    [Consumes("application/json")]
    public async Task<IActionResult> LoginApi([FromBody] LoginRequest dto)
    {
        var email = (dto.Email ?? "").Trim().ToLowerInvariant();
        var password = (dto.Password ?? "").Trim();

        var user = await HandleLogin(email, password);
        if (user is null) return Unauthorized();

        HttpContext.Session.SetInt32("SessionUserId", user.Id);

        return Ok(new LoginResponse(user.Id, user.Email, user.IsAdmin));
    }

    [HttpPost("login")]
    [Consumes("application/x-www-form-urlencoded")]
    public async Task<IActionResult> LoginWeb([FromForm] LoginFormViewModel vm)
    {
        vm.Email = (vm.Email ?? "").Trim().ToLowerInvariant();
        vm.Password = (vm.Password ?? "").Trim();

        if (!ModelState.IsValid) return Problem("Invalid form data");

        var user = await HandleLogin(vm.Email, vm.Password);
        if (user is null)
        {
            ModelState.AddModelError("", "Invalid email or password.");
            return View("Login", vm);
        }

        HttpContext.Session.SetInt32("SessionUserId", user.Id);

        return RedirectToAction("Index", "Home");
    }

    private async Task<User?> HandleLogin(string email, string password)
    {
        var user = await _context.Users
            .AsNoTracking()
            .FirstOrDefaultAsync(u => u.Email == email);

        if (user == null) return null;
        if (!_passwordService.Verify(password, user.PasswordHash)) return null;

        return user;
    }


}