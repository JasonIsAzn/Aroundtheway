

using System.Data;
using Aroundtheway.Api.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Aroundtheway.Api.Controllers.Api;

[ApiController]
[Route("api/[controller]")]
public class StatusController : ControllerBase
{
    [HttpGet("")]
    public IActionResult ApiConnection()
    {
        return Ok(new { ok = true, message = "API Connected Successfully" });
    }

    [HttpGet("db")]
    public async Task<IActionResult> Db([FromServices] AppDbContext db, CancellationToken ct)
    {
        var canConnect = await db.Database.CanConnectAsync(ct);
        if (!canConnect) return StatusCode(503, new { db = "down" });

        return Ok(new
        {
            db = "ok",
            provider = db.Database.ProviderName
        });

    }
}