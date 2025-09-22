using System.Security.Claims;
using Aroundtheway.Api.Data;
using Aroundtheway.Api.Models;
using Aroundtheway.Api.ViewModels.Users;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Aroundtheway.Api.Controllers;

[Route("admin")]
[Authorize(Policy = "AdminOnly")]
public class AdminController : Controller
{
    private readonly AppDbContext _context;

    public AdminController(AppDbContext context)
    {
        _context = context;
    }


    [HttpGet("")]
    public async Task<IActionResult> Index()
    {
        var users = await _context.Users
            .AsNoTracking()
            .OrderBy(u => u.Id)
            .Select(u => new UserViewModel
            {
                Id = u.Id,
                Email = u.Email,
                GoogleSub = u.GoogleSub ?? "n/a",
                CreatedAt = u.CreatedAt,
                UpdatedAt = u.UpdatedAt,
                IsAdmin = u.IsAdmin,
                Address = u.Address,
                CreditCard = u.CreditCard
            })
            .ToListAsync();

        return View(users);
    }

    [HttpPost("promote/{id}")]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Promote(int id)
    {
        var target = await _context.Users.FirstOrDefaultAsync(u => u.Id == id);
        if (target == null)
        {
            TempData["Error"] = "User not found.";
            return RedirectToAction(nameof(Index));
        }

        if (target.IsAdmin)
        {
            TempData["Info"] = "User is already an admin.";
            return RedirectToAction(nameof(Index));
        }

        target.IsAdmin = true;
        await _context.SaveChangesAsync();

        TempData["Success"] = $"Promoted {target.Email} to admin.";
        return RedirectToAction(nameof(Index));
    }

    [HttpPost("demote/{id}")]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Demote(int id)
    {
        var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (int.TryParse(currentUserId, out var me) && me == id)
        {
            TempData["Error"] = "You cannot demote yourself.";
            return RedirectToAction(nameof(Index));
        }

        var target = await _context.Users.FirstOrDefaultAsync(u => u.Id == id);
        if (target == null)
        {
            TempData["Error"] = "User not found.";
            return RedirectToAction(nameof(Index));
        }

        if (!target.IsAdmin)
        {
            TempData["Info"] = "User is not an admin.";
            return RedirectToAction(nameof(Index));
        }

        var adminCount = await _context.Users.CountAsync(u => u.IsAdmin);
        if (adminCount <= 1)
        {
            TempData["Error"] = "Cannot demote the last remaining admin.";
            return RedirectToAction(nameof(Index));
        }

        target.IsAdmin = false;
        await _context.SaveChangesAsync();

        TempData["Success"] = $"Demoted {target.Email} to user.";
        return RedirectToAction(nameof(Index));
    }
}