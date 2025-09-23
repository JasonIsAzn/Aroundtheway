using System.Security.Claims;
using Aroundtheway.Api.Data;
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
    private readonly string SessionUserId;

    public AdminController(AppDbContext context, IHttpContextAccessor httpContextAccessor)
    {
        _context = context;
        SessionUserId = httpContextAccessor.HttpContext?.User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "";
    }

    [HttpPost("users/bulk-delete")]
    public async Task<IActionResult> BulkDeleteUsers([FromBody] BulkUserActionRequest request)
    {
        var users = await _context.Users
            .Where(u => request.UserIds.Contains(u.Id) && u.Id.ToString() != SessionUserId)
            .ToListAsync();

        _context.Users.RemoveRange(users);
        await _context.SaveChangesAsync();

        return Ok(new { message = $"Deleted {users.Count} users" });
    }

    [HttpPost("users/bulk-promote")]
    public async Task<IActionResult> BulkPromoteUsers([FromBody] BulkUserActionRequest request)
    {
        var users = await _context.Users
            .Where(u => request.UserIds.Contains(u.Id))
            .ToListAsync();

        foreach (var user in users)
        {
            user.IsAdmin = true;
            user.UpdatedAt = DateTime.UtcNow;
        }

        await _context.SaveChangesAsync();

        return Ok(new { message = $"Promoted {users.Count} users to admin" });
    }

    [HttpPost("users/bulk-demote")]
    public async Task<IActionResult> BulkDemoteUsers([FromBody] BulkUserActionRequest request)
    {
        var users = await _context.Users
            .Where(u => request.UserIds.Contains(u.Id) && u.Id.ToString() != SessionUserId)
            .ToListAsync();

        foreach (var user in users)
        {
            user.IsAdmin = false;
            user.UpdatedAt = DateTime.UtcNow;
        }

        await _context.SaveChangesAsync();

        return Ok(new { message = $"Removed admin role from {users.Count} users" });
    }
}

public class BulkUserActionRequest
{
    public List<int> UserIds { get; set; } = new();