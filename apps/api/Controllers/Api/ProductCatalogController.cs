using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Aroundtheway.Api.Data;
using Aroundtheway.Api.Dtos.Products;

namespace Aroundtheway.Api.Controllers.Api;

[ApiController]
[Route("api/products")]
public class ProductsCatalogController : ControllerBase
{
    private readonly AppDbContext _db;
    public ProductsCatalogController(AppDbContext db) => _db = db;

    [HttpGet]
    public async Task<ActionResult<IEnumerable<ProductListItemDto>>> GetCatalog(
        [FromQuery] string? q,
        [FromQuery] string? color,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        if (page < 1) page = 1;
        if (pageSize < 1 || pageSize > 100) pageSize = 20;

        var query = _db.Posts.AsNoTracking().AsQueryable();

        if (!string.IsNullOrWhiteSpace(q))
            query = query.Where(p => EF.Functions.Like(p.ProductName, $"%{q}%"));

        if (!string.IsNullOrWhiteSpace(color))
            query = query.Where(p => p.Color == color);

        var items = await query
            .OrderByDescending(p => p.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(p => new ProductListItemDto(
                p.Id,
                p.ProductName,
                p.Color,
                p.Price,
                p.ImageUrls.FirstOrDefault() ?? "",
                (p.NumOfSmall + p.NumOfMedium + p.NumOfLarge + p.NumOfXLarge) > 0
            ))
            .ToListAsync();

        return Ok(items);
    }
}
