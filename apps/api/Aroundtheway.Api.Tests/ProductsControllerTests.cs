using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Aroundtheway.Api.Controllers.Api;
using Aroundtheway.Api.Data;
using Aroundtheway.Api.Dtos.Products;  // <— use the real DTOs
using Aroundtheway.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace Aroundtheway.Api.Tests
{
    public class ProductsControllerTests : IAsyncLifetime
    {
        private readonly SqliteTestDb _fixture;   // your lightweight in-memory sqlite helper
        private readonly AppDbContext _db;

        public ProductsControllerTests()
        {
            _fixture = new SqliteTestDb();
            _db = _fixture.Db;
        }

        public Task InitializeAsync() => Task.CompletedTask;
        public Task DisposeAsync() => _fixture.DisposeAsync().AsTask();

        // ----------------- /api/products (list) -----------------

        [Fact]
        public async Task GetProducts_returns_desc_by_createdAt_and_inStock_flag()
        {
            var now = DateTime.UtcNow;

            // Seed a user to satisfy FK
            var user = new User { Email = "seed@x.com", PasswordHash = "x" };
            _db.Users.Add(user);
            await _db.SaveChangesAsync();

            _db.Posts.AddRange(
                new Post
                {
                    // Ensure unique ProductId
                    ProductId = "alpha-" + Guid.NewGuid().ToString("N"),
                    ProductName = "Alpha Tee",
                    Color = "Black",
                    Price = 2500,
                    ImageUrls = new List<string> { "https://img/alpha.png" },
                    NumOfSmall = 0,
                    NumOfMedium = 0,
                    NumOfLarge = 0,
                    NumOfXLarge = 0, // out of stock
                    CreatedAt = now.AddMinutes(-30),
                    UpdatedAt = now.AddMinutes(-30),
                    UserId = user.Id
                },
                new Post
                {
                    ProductId = "bravo-" + Guid.NewGuid().ToString("N"),
                    ProductName = "Bravo Tee",
                    Color = "White",
                    Price = 3000,
                    ImageUrls = new List<string> { "https://img/bravo.png" },
                    NumOfSmall = 1,
                    NumOfMedium = 0,
                    NumOfLarge = 0,
                    NumOfXLarge = 0, // in stock
                    CreatedAt = now.AddMinutes(-10),
                    UpdatedAt = now.AddMinutes(-10),
                    UserId = user.Id
                },
                new Post
                {
                    ProductId = "charlie-" + Guid.NewGuid().ToString("N"),
                    ProductName = "Charlie Tee",
                    Color = "Red",
                    Price = 2000,
                    ImageUrls = new List<string> { "https://img/charlie.png" },
                    NumOfSmall = 0,
                    NumOfMedium = 2,
                    NumOfLarge = 0,
                    NumOfXLarge = 0, // in stock
                    CreatedAt = now.AddMinutes(-20),
                    UpdatedAt = now.AddMinutes(-20),
                    UserId = user.Id
                }
            );
            await _db.SaveChangesAsync();

            var sut = new ProductsCatalogController(_db);

            var result = await sut.GetProducts();

            var ok = Assert.IsType<OkObjectResult>(result.Result);
            var items = Assert.IsAssignableFrom<IEnumerable<ProductListItemDto>>(ok.Value).ToList();

            // order: newest first -> Bravo (-10), Charlie (-20), Alpha (-30)
            Assert.Equal(3, items.Count);
            Assert.Equal("Bravo Tee", items[0].ProductName);
            Assert.Equal("Charlie Tee", items[1].ProductName);
            Assert.Equal("Alpha Tee", items[2].ProductName);

            // in-stock flags
            Assert.True(items[0].InStock);  // Bravo
            Assert.True(items[1].InStock);  // Charlie
            Assert.False(items[2].InStock); // Alpha
        }

        // ----------------- /api/products/{id} (details) -----------------

        [Fact]
        public async Task GetProduct_returns_NotFound_when_missing()
        {
            var sut = new ProductDetailsController(_db);

            var result = await sut.GetProduct(999);

            var notFound = Assert.IsType<NotFoundObjectResult>(result.Result);
            var pd = Assert.IsType<ProblemDetails>(notFound.Value);
            Assert.Equal("Product not found", pd.Title);
            Assert.Contains("999", pd.Detail!);
        }

        [Fact]
        public async Task GetProduct_returns_dto_with_sizes_and_timestamps()
        {
            var created = DateTime.UtcNow.AddHours(-1);
            var updated = DateTime.UtcNow;

            // Seed a user to satisfy FK
            var user = new User { Email = "owner@x.com", PasswordHash = "x" };
            _db.Users.Add(user);
            await _db.SaveChangesAsync();

            var post = new Post
            {
                ProductId = "delta-" + Guid.NewGuid().ToString("N"), // unique
                ProductName = "Delta Tee",
                Color = "Blue",
                Price = 2200,
                ImageUrls = new List<string> { "https://img/delta.png" },
                NumOfSmall = 1,
                NumOfMedium = 2,
                NumOfLarge = 3,
                NumOfXLarge = 4,
                CreatedAt = created,
                UpdatedAt = updated,
                UserId = user.Id
            };
            _db.Posts.Add(post);
            await _db.SaveChangesAsync();

            var sut = new ProductDetailsController(_db);

            var result = await sut.GetProduct(post.Id);

            var ok = Assert.IsType<OkObjectResult>(result.Result);
            var dto = Assert.IsType<ProductDetailsDto>(ok.Value); // <— strong-typed, no dynamic

            Assert.Equal(post.Id, dto.Id);
            Assert.Equal("Delta Tee", dto.ProductName);
            Assert.Equal("Blue", dto.Color);
            Assert.Equal(2200, dto.Price);

            Assert.NotNull(dto.Sizes);
            Assert.Equal(1, dto.Sizes["S"]);
            Assert.Equal(2, dto.Sizes["M"]);
            Assert.Equal(3, dto.Sizes["L"]);
            Assert.Equal(4, dto.Sizes["XL"]);

            Assert.Equal(created, dto.CreatedAt);
            Assert.Equal(updated, dto.UpdatedAt);

            Assert.Contains("https://img/delta.png", dto.ImageUrls);
        }
    }
}
