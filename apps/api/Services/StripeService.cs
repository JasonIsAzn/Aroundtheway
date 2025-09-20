// Services/StripeService.cs
using Stripe;
using Stripe.Checkout;

namespace Aroundtheway.Api.Services;

public class StripeService
{
    public StripeService(IConfiguration cfg)
    {
        StripeConfiguration.ApiKey = cfg["Stripe:SecretKey"];
    }

    public async Task<Session> CreateCheckoutSessionAsync(
        IEnumerable<SessionLineItemOptions> lineItems,
        string successUrl,
        string cancelUrl,
        string? customerEmail = null)
    {
        var options = new SessionCreateOptions
        {
            Mode = "payment",
            SuccessUrl = successUrl,
            CancelUrl = cancelUrl,
            CustomerEmail = customerEmail,
            LineItems = [.. lineItems]
        };

        var service = new SessionService();
        return await service.CreateAsync(options);
    }
}
