namespace Aroundtheway.Api.ViewModels.Transactions;

public class TransactionItemRowViewModel
{
    public string ProductId { get; set; } = null!;
    public string Name { get; set; } = null!;
    public int UnitAmountCents { get; set; }
    public int Quantity { get; set; }
}