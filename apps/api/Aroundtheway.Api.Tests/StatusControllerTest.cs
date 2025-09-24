// apps/api/Aroundtheway.Api.Tests/StatusControllerTest.cs
using System.Text.Json;
using System.Threading;
using Aroundtheway.Api.Controllers.Api;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc;
using Xunit;

namespace Aroundtheway.Api.Tests;

public class StatusControllerTests
{
    [Fact]
    public void ApiConnection_returns_ok_with_expected_payload()
    {
        var controller = new StatusController();

        var result = controller.ApiConnection();

        var ok = Assert.IsType<OkObjectResult>(result);
        ok.StatusCode.Should().Be(200);

        var json = JsonSerializer.Serialize(ok.Value);
        using var doc = JsonDocument.Parse(json);
        var root = doc.RootElement;

        root.GetProperty("ok").GetBoolean().Should().BeTrue();
        root.GetProperty("message").GetString().Should().Be("API Connected Successfully");
    }

    [Fact]
    public async Task Db_returns_ok_when_database_is_reachable()
    {
        using var fixture = new SqliteTestDb();
        var controller = new StatusController();

        var result = await controller.Db(fixture.Db, CancellationToken.None);

        var ok = Assert.IsType<OkObjectResult>(result);
        ok.StatusCode.Should().Be(200);

        var json = JsonSerializer.Serialize(ok.Value);
        using var doc = JsonDocument.Parse(json);
        var root = doc.RootElement;

        root.GetProperty("db").GetString().Should().Be("ok");
        root.GetProperty("provider").GetString().Should().Contain("Sqlite");
    }
}
