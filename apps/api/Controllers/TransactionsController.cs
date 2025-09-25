using Aroundtheway.Api.Data;
using Aroundtheway.Api.ViewModels.Transactions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Aroundtheway.Api.Controllers;

[Route("admin/transactions")]
[Authorize(Policy = "AdminOnly")]
public class AdminTransactionsController : Controller
{
    private readonly AppDbContext _db;
    public AdminTransactionsController(AppDbContext db) => _db = db;

    [HttpGet("")]
    public IActionResult Index()
    {
        var uid = HttpContext.Session.GetInt32("SessionUserId");


        var me = _db.Users.AsNoTracking().FirstOrDefault(u => u.Id == uid!.Value);
        if (me is null || !me.IsAdmin) return Forbid();

        var vms = _db.Transactions
            .AsNoTracking()
            .OrderByDescending(t => t.CreatedAt)
            .Include(t => t.Items)
            .Select(t => new TransactionRowViewModel
            {
                Id = t.Id,
                UserId = t.UserId,
                TotalCents = t.TotalCents,
                Currency = t.Currency,
                Address = t.Address,
                CreatedAt = t.CreatedAt,
                Items = t.Items.Select(i => new TransactionItemRowViewModel
                {
                    ProductId = i.ProductId,
                    Name = i.Name,
                    UnitAmountCents = i.UnitAmountCents,
                    Quantity = i.Quantity
                }).ToList()
            })
            .ToList();

        return View("Index", vms);
    }
}
