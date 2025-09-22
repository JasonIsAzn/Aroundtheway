// Dtos/CheckoutDtos.cs
namespace Aroundtheway.Api.Dtos.Checkout;

public record CheckoutItemDto(
    string Name,
    long UnitAmountCents,
    int Quantity,
    string? ImageUrl = null,
    string Currency = "usd"
);

public record CreateCheckoutSessionRequest(
    List<CheckoutItemDto> Items,
    string SuccessUrl,
    string CancelUrl,
    string? CustomerEmail = null
);

public record CreateCheckoutSessionResponse(string Url);
