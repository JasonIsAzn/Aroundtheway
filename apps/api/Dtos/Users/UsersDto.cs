public record AddressDto(
    string? Address,
    string? City,
    string? State,
    string? ZipCode,
    string? Country
);

public record UserProfileResponse(
    int Id,
    string Email,
    bool IsAdmin,
    DateTime CreatedAt,
    DateTime UpdatedAt,
    string? GoogleSub,
    AddressDto Address
);

public record Problem(string Title, int Status, string? Detail = null);
