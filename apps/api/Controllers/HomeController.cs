using System.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using Aroundtheway.Api.Models;
using Aroundtheway.Api.Data;
using Microsoft.EntityFrameworkCore;

namespace Aroundtheway.Api.Controllers;

public class HomeController : Controller
{
    private readonly AppDbContext _context;

    public HomeController(AppDbContext context)
    {
        _context = context;
    }

    public async Task<IActionResult> Index()
    {
        var userId = HttpContext.Session.GetInt32("SessionUserId");

        if (userId != null)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId.Value);
            ViewBag.CurrentUser = user;
        }
        ViewData["Title"] = "Home Page";
        return View();
    }

    public async Task<IActionResult> ImageUploadTest()
    {
        var userId = HttpContext.Session.GetInt32("SessionUserId");

        if (userId != null)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId.Value);
            ViewBag.CurrentUser = user;
        }
        ViewData["Title"] = "Home Page";
        return View();
    }

    [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
    public IActionResult Error()
    {
        return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
    }
}
