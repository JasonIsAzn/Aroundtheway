namespace Aroundtheway.Api.Dtos.Auth;

public record LoginResponse(
    int Id,
    string Email,
    bool IsAdmin
);