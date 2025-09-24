using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Aroundtheway.Api.Data;
using Aroundtheway.Api.Dtos.Products;

namespace Aroundtheway.Api.Controllers.Api;

[ApiController]
[Route("api/products/{id}")]
public class ProductDetailsController : ControllerBase
{
    private readonly AppDbContext _db;
    public ProductDetailsController(AppDbContext db) => _db = db;

    [HttpGet]
    public async Task<ActionResult<ProductDetailsDto>> GetProduct(int id)
    {
        var product = await _db.Posts.AsNoTracking()
            .Include(p => p.User)
            .FirstOrDefaultAsync(p => p.Id == id);

        if (product is null)
            return NotFound(new ProblemDetails
            {
                Title = "Product not found",
                Detail = $"No product with ID {id} exists."
            });

        var sizes = new Dictionary<string, int>
        {
            { "S",  product.NumOfSmall },
            { "M",  product.NumOfMedium },
            { "L",  product.NumOfLarge },
            { "XL", product.NumOfXLarge }
        };

        var dto = new ProductDetailsDto(
            product.Id,
            product.ProductName,
            product.Color,
            product.Price,
            product.ImageUrls,
            sizes,
            product.CreatedAt,
            product.UpdatedAt
        );

        return Ok(dto);
    }
}
