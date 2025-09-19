namespace Aroundtheway.Api.Dtos.Auth;

public record RegisterResponse(
    int Id,
    string Email,
    bool IsAdmin
);