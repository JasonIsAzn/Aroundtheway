using System.Security.Claims;
using Aroundtheway.Api.Data;
using Aroundtheway.Api.Dtos.Auth;
using Aroundtheway.Api.Models;
using Aroundtheway.Api.Services;
using Aroundtheway.Api.ViewModels.Account;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Google.Apis.Auth;

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


        if (await _context.Users.AsNoTracking().AnyAsync(u => u.Email == email))
            return Conflict(new ProblemDetails
            {
                Title = "Email already in use",
                Status = StatusCodes.Status409Conflict
            });


        var user = await HandleRegister(email, password);

        HttpContext.Session.SetInt32("SessionUserId", user.Id);

        return Created($"/api/users/{user.Id}", new RegisterResponse(user.Id, user.Email, user.IsAdmin));
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
    public async Task<IActionResult> LoginApi(LoginRequest dto)
    {
        var email = (dto.Email ?? "").Trim().ToLowerInvariant();
        var password = (dto.Password ?? "").Trim();

        var user = await HandleLogin(email, password);
        if (user is null) return Unauthorized(new { message = "Invalid email or password." });

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
            return View("../Account/Login", vm);
        }

        if (!user.IsAdmin)
        {
            ModelState.AddModelError("", "You are not an admin.");
            return View("../Account/Login", vm);
        }

        // Create claims
        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new(ClaimTypes.Name, user.Email),
            new(ClaimTypes.Email, user.Email),
            new("role", "admin")
        };

        var identity = new ClaimsIdentity(claims, CookieAuthenticationDefaults.AuthenticationScheme);
        var principal = new ClaimsPrincipal(identity);

        var props = new AuthenticationProperties
        {
            IsPersistent = true,
            AllowRefresh = true,
        };

        await HttpContext.SignInAsync(CookieAuthenticationDefaults.AuthenticationScheme, principal, props);

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

    [HttpGet("me")]
    public async Task<IActionResult> Me()
    {
        var userId = HttpContext.Session.GetInt32("SessionUserId");
        if (userId == null) return Unauthorized();

        try
        {
            var user = await _context.Users.FindAsync(userId.Value);
            if (user == null) return Unauthorized();

            return Ok(new
            {
                user.Id,
                user.Email,
                user.IsAdmin,
                user.CreatedAt,
                user.UpdatedAt,
                user.GoogleSub
            });
        }
        catch (Exception ex)
        {
            // Optionally log the exception here
            return StatusCode(500, new { message = "An error occurred while retrieving user information." });
        }
    }


    [HttpPost("logout")]
    [Consumes("application/json")]
    public IActionResult LogoutApi()
    {

        HttpContext.Session.Clear();
        return Ok(new { message = "Logged out successfully" });
    }

    [HttpPost("logout")]
    [Consumes("application/x-www-form-urlencoded")]
    public async Task<IActionResult> LogoutWeb()
    {
        await HttpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);
        HttpContext.Session.Clear();
        return RedirectToAction("Index", "Home");
    }

    [HttpPost("google")]
    [Consumes("application/json")]
    public async Task<IActionResult> GoogleLogin([FromBody] GoogleLoginRequest dto)
    {
        if (string.IsNullOrWhiteSpace(dto.IdToken))
            return BadRequest(new { message = "Missing id_token" });

        var clientId = "370878605755-ag67ab20l16ebblvkt5bbf65kcd5p40s.apps.googleusercontent.com";

        GoogleJsonWebSignature.Payload payload;
        try
        {
            payload = await GoogleJsonWebSignature.ValidateAsync(
                dto.IdToken,
                new GoogleJsonWebSignature.ValidationSettings
                {
                    Audience = [clientId]
                }
            );
        }
        catch (Exception)
        {
            return Unauthorized(new { message = "Invalid Google token" });
        }

        var email = (payload.Email ?? "").Trim().ToLowerInvariant();
        var googleSub = payload.Subject;


        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.GoogleSub == googleSub || u.Email == email);

        if (user == null)
        {
            user = new User
            {
                Email = email,
                GoogleSub = googleSub,
                PasswordHash = null,
            };
            _context.Users.Add(user);
            await _context.SaveChangesAsync();
        }
        else
        {
            user.GoogleSub ??= googleSub;
            user.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
        }

        HttpContext.Session.SetInt32("SessionUserId", user.Id);

        return Ok(new LoginResponse(user.Id, user.Email, user.IsAdmin));
    }
}