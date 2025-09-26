using Aroundtheway.Api.Services;

namespace Aroundtheway.Api.Tests;

// Minimal deterministic password service for tests
public sealed class FakePasswordService : IPasswordService
{
    public string Hash(string password) => $"HASH::{password}";
    public bool Verify(string password, string hash) => hash == Hash(password);
}
