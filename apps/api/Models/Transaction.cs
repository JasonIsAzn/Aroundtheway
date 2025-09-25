// Models/Transaction.cs
using System.ComponentModel.DataAnnotations;

namespace Aroundtheway.Api.Models;

public class Transaction
{
    [Key] public int Id { get; set; }

    public int? UserId { get; set; }     // int? FK → Users.Id
    public User? User { get; set; }      // navigation

    public int TotalCents { get; set; }
    public string Currency { get; set; } = "USD";
    public string Address { get; set; } = null!;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public List<TransactionItem> Items { get; set; } = new();
}

public class TransactionItem
{
    [Key] public int Id { get; set; }
    public int TransactionId { get; set; }
    public Transaction Transaction { get; set; } = null!;

    public string ProductId { get; set; } = null!;
    public string Name { get; set; } = null!;
    public int UnitAmountCents { get; set; }
    public int Quantity { get; set; }
}
