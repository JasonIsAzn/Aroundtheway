namespace Aroundtheway.Api.Dtos.Products;

public record ProductListItemDto(
    int Id,
    string ProductName,
    string Color,
    double Price,
    string ThumbnailUrl,
    bool InStock
);

public record ProductDetailsDto(
    int Id,
    string ProductName,
    string Color,
    double Price,
    List<string> ImageUrls,
    Dictionary<string, int> Sizes,
    DateTime CreatedAt,
    DateTime UpdatedAt
);
