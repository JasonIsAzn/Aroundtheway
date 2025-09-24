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
    public async Task<ActionResult<IEnumerable<ProductListItemDto>>> GetProducts()
    {

        var query = _db.Posts.AsNoTracking().AsQueryable();

        var items = await query
            .OrderByDescending(p => p.CreatedAt)
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
