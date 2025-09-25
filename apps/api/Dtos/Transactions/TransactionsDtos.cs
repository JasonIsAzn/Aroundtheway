using System.ComponentModel.DataAnnotations;

namespace Aroundtheway.Api.Dtos.Transactions;

public class CreateTransactionRequest
{
    public string Currency { get; set; } = "USD";
    public string Address { get; set; } = null!;
    [MinLength(1)] public List<CreateTransactionItem> Items { get; set; } = new();
}

public class CreateTransactionItem
{
    public string ProductId { get; set; } = null!;
    public string Name { get; set; } = null!;
    public int UnitAmountCents { get; set; }
    public int Quantity { get; set; }
}

public class TransactionItemDto
{
    public string ProductId { get; set; } = null!;
    public string Name { get; set; } = null!;
    public int UnitAmountCents { get; set; }
    public int Quantity { get; set; }
}

public class TransactionDto
{
    public int Id { get; set; }
    public string? UserId { get; set; }
    public int TotalCents { get; set; }
    public string Currency { get; set; } = null!;
    public string Address { get; set; } = null!;
    public DateTime CreatedAt { get; set; }
    public List<TransactionItemDto> Items { get; set; } = new();
}
