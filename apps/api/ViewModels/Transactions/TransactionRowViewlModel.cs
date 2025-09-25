using System.Globalization;

namespace Aroundtheway.Api.ViewModels.Transactions;

public class TransactionRowViewModel
{
    public int Id { get; set; }
    public int? UserId { get; set; }
    public int TotalCents { get; set; }
    public string Currency { get; set; } = "USD";
    public string Address { get; set; } = "";
    public DateTime CreatedAt { get; set; }

    public List<TransactionItemRowViewModel> Items { get; set; } = new();

    // Helpers for the view
    public string TotalFormatted => decimal.Divide(TotalCents, 100).ToString("C", CultureInfo.GetCultureInfo("en-US"));

    public int ItemsCount => Items?.Sum(i => i.Quantity) ?? 0;

    public string ItemsSummary =>
        (Items?.Count ?? 0) == 0
            ? "—"
            : string.Join(", ", Items!.Select(i => $"{i.Name} ×{i.Quantity}"));
}
