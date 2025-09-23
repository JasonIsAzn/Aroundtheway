using System.Text.Json;
using Aroundtheway.Api.Data;
using Aroundtheway.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;


namespace Aroundtheway.Api.Controllers.Api;

[ApiController]
[Route("api/users")]
public class UsersController : ControllerBase
{
    private readonly AppDbContext _context;
    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web);

    public UsersController(AppDbContext context)
    {
        _context = context;
    }

    private int? GetSessionUserId() => HttpContext.Session.GetInt32("SessionUserId");

    private static AddressDto ParseAddress(string? json)
    {
        if (string.IsNullOrWhiteSpace(json)) return new AddressDto(null, null, null, null, null);
        try
        {
            var dto = JsonSerializer.Deserialize<AddressDto>(json, JsonOptions);
            return dto ?? new AddressDto(null, null, null, null, null);
        }
        catch
        {
            return new AddressDto(json, null, null, null, null);
        }
    }

    private static string SerializeAddress(AddressDto dto)
    {
        var clean = new AddressDto(
            dto.Address?.Trim(),
            dto.City?.Trim(),
            dto.State?.Trim(),
            dto.ZipCode?.Trim(),
            dto.Country?.Trim()
        );
        return JsonSerializer.Serialize(clean, JsonOptions);
    }

    [HttpGet("me")]
    public async Task<IActionResult> GetMe()
    {
        var uid = GetSessionUserId();
        if (uid is null) return Unauthorized(new Problem("Not authenticated", 401));

        var user = await _context.Users.AsNoTracking()
            .FirstOrDefaultAsync(u => u.Id == uid.Value);

        if (user is null) return NotFound(new Problem("User not found", 404));

        var addr = ParseAddress(user.Address);
        var resp = new UserProfileResponse(
            user.Id,
            user.Email,
            user.IsAdmin,
            user.CreatedAt,
            user.UpdatedAt,
            user.GoogleSub,
            addr
        );
        return Ok(resp);
    }

    [HttpPut("me/address")]
    [Consumes("application/json")]
    public async Task<IActionResult> UpdateMyAddress([FromBody] AddressDto dto)
    {
        var uid = GetSessionUserId();
        if (uid is null) return Unauthorized(new Problem("Not authenticated", 401));

        if ((dto.ZipCode?.Length ?? 0) > 20)
            return BadRequest(new Problem("Invalid ZIP/Postal Code", 400));
        if ((dto.State?.Length ?? 0) > 100)
            return BadRequest(new Problem("Invalid State/Province", 400));
        if ((dto.Country?.Length ?? 0) > 100)
            return BadRequest(new Problem("Invalid Country", 400));

        var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == uid.Value);
        if (user is null) return NotFound(new Problem("User not found", 404));

        user.Address = SerializeAddress(dto);
        user.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        var addr = ParseAddress(user.Address);
        var resp = new UserProfileResponse(
            user.Id,
            user.Email,
            user.IsAdmin,
            user.CreatedAt,
            user.UpdatedAt,
            user.GoogleSub,
            addr
        );
        return Ok(resp);
    }
}
