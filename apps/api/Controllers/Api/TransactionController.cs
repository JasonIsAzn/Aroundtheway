// Controllers/Api/TransactionsController.cs
using Aroundtheway.Api.Data;
using Aroundtheway.Api.Dtos.Transactions;
using Aroundtheway.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

[ApiController]
[Route("api/transactions")]
public class TransactionsController : ControllerBase
{
    private readonly AppDbContext _db;
    public TransactionsController(AppDbContext db) => _db = db;

    // POST /api/transactions
    [HttpPost]
    public ActionResult<TransactionDto> Create([FromBody] CreateTransactionRequest dto)
    {
        if (!ModelState.IsValid) return ValidationProblem(ModelState);
        if (dto.Items is null || dto.Items.Count == 0)
            return BadRequest(new { error = "At least one item is required." });
        if (dto.Items.Any(i => i.UnitAmountCents <= 0 || i.Quantity <= 0))
            return UnprocessableEntity(new { error = "Invalid item values." });

        // ← Get the logged-in user id from session; null = guest
        var sessionUserId = HttpContext.Session.GetInt32("SessionUserId");

        var items = dto.Items.Select(i => new TransactionItem
        {
            ProductId = i.ProductId,
            Name = i.Name,
            UnitAmountCents = i.UnitAmountCents,
            Quantity = i.Quantity
        }).ToList();

        var tx = new Transaction
        {
            UserId = sessionUserId, // null for guests
            TotalCents = items.Sum(i => i.UnitAmountCents * i.Quantity),
            Currency = dto.Currency.ToUpperInvariant(),
            Address = dto.Address,
            CreatedAt = DateTime.UtcNow,
            Items = items
        };

        _db.Transactions.Add(tx);
        _db.SaveChanges();

        return CreatedAtAction(nameof(GetById), new { id = tx.Id }, ToDto(tx));
    }

    // GET /api/transactions/me
    [HttpGet("me")]
    public ActionResult<IEnumerable<TransactionDto>> GetMine()
    {
        var uid = HttpContext.Session.GetInt32("SessionUserId");
        if (uid is null) return Unauthorized(new { error = "Login required." });

        var list = _db.Transactions
            .AsNoTracking()
            .Where(t => t.UserId == uid)
            .OrderByDescending(t => t.CreatedAt)
            .Include(t => t.Items)
            .ToList();

        return Ok(list.Select(ToDto));
    }

    // GET /api/transactions  (admin-only; check via Users.IsAdmin)
    [HttpGet]
    public ActionResult<IEnumerable<TransactionDto>> GetAll()
    {
        var uid = HttpContext.Session.GetInt32("SessionUserId");
        if (uid is null) return Unauthorized(new { error = "Login required." });

        var user = _db.Users.AsNoTracking().FirstOrDefault(u => u.Id == uid.Value);
        if (user is null || !user.IsAdmin) return Forbid();

        var list = _db.Transactions
            .AsNoTracking()
            .OrderByDescending(t => t.CreatedAt)
            .Include(t => t.Items)
            .ToList();

        return Ok(list.Select(ToDto));
    }

    // GET /api/transactions/{id}
    [HttpGet("{id:int}")]
    public ActionResult<TransactionDto> GetById([FromRoute] int id)
    {
        var tx = _db.Transactions
            .AsNoTracking()
            .Include(t => t.Items)
            .FirstOrDefault(t => t.Id == id);

        if (tx is null) return NotFound();
        return Ok(ToDto(tx));
    }

    private static TransactionDto ToDto(Transaction t) => new()
    {
        Id = t.Id,
        UserId = t.UserId?.ToString(),
        TotalCents = t.TotalCents,
        Currency = t.Currency,
        Address = t.Address,
        CreatedAt = t.CreatedAt,
        Items = t.Items.Select(i => new TransactionItemDto
        {
            ProductId = i.ProductId,
            Name = i.Name,
            UnitAmountCents = i.UnitAmountCents,
            Quantity = i.Quantity
        }).ToList()
    };
}
