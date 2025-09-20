using Aroundtheway.Api.Dtos.Checkout;
using Aroundtheway.Api.Services;
using Microsoft.AspNetCore.Mvc;
using Stripe.Checkout;

namespace Aroundtheway.Api.Controllers.Api;

[ApiController]
[Route("api/checkout")]
public class CheckoutController : ControllerBase
{
    private readonly StripeService _stripe;
    public CheckoutController(StripeService stripe) { _stripe = stripe; }

    [HttpPost("session")]
    public async Task<ActionResult<CreateCheckoutSessionResponse>> CreateSession([FromBody] CreateCheckoutSessionRequest req)
    {
        if (req is null || req.Items is null || req.Items.Count == 0)
            return BadRequest(new { error = "Items are required." });

        if (string.IsNullOrWhiteSpace(req.SuccessUrl) || string.IsNullOrWhiteSpace(req.CancelUrl))
            return BadRequest(new { error = "SuccessUrl and CancelUrl are required." });

        // Minimal validation
        foreach (var i in req.Items)
        {
            if (i.UnitAmountCents <= 0) return BadRequest(new { error = "UnitAmountCents must be > 0." });
            if (i.Quantity <= 0) return BadRequest(new { error = "Quantity must be > 0." });
            if (string.IsNullOrWhiteSpace(i.Name)) return BadRequest(new { error = "Name is required." });
        }

        var lineItems = req.Items.Select(i => new SessionLineItemOptions
        {
            Quantity = i.Quantity,
            PriceData = new SessionLineItemPriceDataOptions
            {
                Currency = i.Currency,
                UnitAmount = i.UnitAmountCents,
                ProductData = new SessionLineItemPriceDataProductDataOptions
                {
                    Name = i.Name,
                    Images = string.IsNullOrWhiteSpace(i.ImageUrl) ? null : new List<string> { i.ImageUrl }
                }
            }
        });

        var session = await _stripe.CreateCheckoutSessionAsync(
            lineItems,
            req.SuccessUrl,
            req.CancelUrl,
            req.CustomerEmail
        );

        return Ok(new CreateCheckoutSessionResponse(session.Url));
    }

    [HttpGet("session/{id}")]
    public async Task<IActionResult> GetSession(string id)
    {
        var service = new SessionService();
        var session = await service.GetAsync(id, new SessionGetOptions
        {
            Expand = ["payment_intent"]
        });

        return Ok(new
        {
            id = session.Id,
            amount_total = session.AmountTotal,
            currency = session.Currency,
            payment_status = session.PaymentStatus,
            payment_intent_id = session.PaymentIntentId
        });
    }
}
