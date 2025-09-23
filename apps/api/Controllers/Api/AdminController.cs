using System.Text;
using Aroundtheway.Api.Data;
using Aroundtheway.Api.Models;
using Aroundtheway.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Aroundtheway.Api.Controllers.Api;

[ApiController]
[Route("api/admin")]
[Authorize(Roles = "admin")]
public class AdminController : Controller
{
    private readonly AppDbContext _context;
    private readonly IPasswordService _passwordService;

    public AdminController(AppDbContext context, IPasswordService passwordService)
    {
        _context = context;
        _passwordService = passwordService;
    }

    [HttpGet("users")]
    public async Task<IActionResult> GetUsers()
    {
        var users = await _context.Users
            .AsNoTracking()
            .Select(u => new
            {
                u.Id,
                u.Email,
                u.IsAdmin,
                u.CreatedAt,
                u.UpdatedAt,
                u.GoogleSub,
                u.Address
            })
            .ToListAsync();

        return Ok(users);
    }

    [HttpPost("users")]
    public async Task<IActionResult> CreateUser([FromBody] CreateUserRequest request)
    {
        if (string.IsNullOrEmpty(request.Email) || string.IsNullOrEmpty(request.Password))
            return BadRequest(new { message = "Email and password are required" });

        var email = request.Email.Trim().ToLowerInvariant();
        var password = request.Password.Trim();

        if (await _context.Users.AnyAsync(u => u.Email == email))
            return Conflict(new { message = "Email already in use" });

        var passwordHash = _passwordService.Hash(password);
        var user = new User
        {
            Email = email,
            PasswordHash = passwordHash
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        return Created($"/api/users/{user.Id}", new
        {
            user.Id,
            user.Email,
            user.IsAdmin,
            user.CreatedAt,
            user.UpdatedAt,
            user.GoogleSub,
            user.Address
        });
    }

    [HttpGet("users/export")]
    public async Task<IActionResult> ExportUsers()
    {
        var users = await _context.Users
            .AsNoTracking()
            .OrderBy(u => u.Email)
            .Select(u => new
            {
                u.Id,
                u.Email,
                u.IsAdmin,
                u.CreatedAt,
                u.UpdatedAt,
                u.GoogleSub,
                u.Address
            })
            .ToListAsync();

        var csv = new StringBuilder();
        csv.AppendLine("Id,Email,IsAdmin,CreatedAt,UpdatedAt,GoogleSub,Address");

        foreach (var user in users)
        {
            csv.AppendLine($"{user.Id},{user.Email},{user.IsAdmin},{user.CreatedAt:O},{user.UpdatedAt:O},{user.GoogleSub ?? ""},{user.Address ?? ""}");
        }

        var bytes = Encoding.UTF8.GetBytes(csv.ToString());
        return File(bytes, "text/csv", "users-export.csv");
    }
}

public class CreateUserRequest
{
    public string Email { get; set; } = "";
    public string Password { get; set; } = "";
}