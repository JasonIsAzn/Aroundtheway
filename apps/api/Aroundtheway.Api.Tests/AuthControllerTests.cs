using System;
using System.Linq;
using System.Threading.Tasks;
using Aroundtheway.Api.Controllers.Api;
using Aroundtheway.Api.Data;
using Aroundtheway.Api.Dtos.Auth;
using Aroundtheway.Api.Models;
using FluentAssertions;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace Aroundtheway.Api.Tests;

public class AuthControllerTests : IAsyncLifetime
{
    private readonly SqliteTestDb _fixture;           // shared in-memory sqlite (already in your repo)
    private readonly AppDbContext _db;
    private readonly FakePasswordService _passwords;  // trivial hash/verify
    private readonly DefaultHttpContext _http;
    private readonly AuthController _sut;

    public AuthControllerTests()
    {
        _fixture = new SqliteTestDb();
        _db = _fixture.Db;
        _passwords = new FakePasswordService();

        _http = new DefaultHttpContext();
        _http.Session = new TestSession(); // simple in-memory ISession (see file below)

        _sut = new AuthController(_db, _passwords)
        {
            ControllerContext = new ControllerContext
            {
                HttpContext = _http
            }
        };
    }

    public Task InitializeAsync() => Task.CompletedTask;
    public async Task DisposeAsync() => await _fixture.DisposeAsync();

    // ---------- REGISTER ----------

    [Fact]
    public async Task Register_BadRequest_when_ModelState_invalid()
    {
        _sut.ModelState.AddModelError("Email", "Required");

        var result = await _sut.RegisterApi(new RegisterRequest { Email = null, Password = "x" });

        var bad = Assert.IsType<BadRequestObjectResult>(result);
        bad.StatusCode.Should().Be(StatusCodes.Status400BadRequest);
    }

    [Fact]
    public async Task Register_Conflict_when_email_taken()
    {
        var email = "test@x.com";
        _db.Users.Add(new User { Email = email, PasswordHash = "whatever" });
        await _db.SaveChangesAsync();

        var result = await _sut.RegisterApi(new RegisterRequest { Email = email, Password = "p" });

        var conflict = Assert.IsType<ConflictObjectResult>(result);
        conflict.StatusCode.Should().Be(StatusCodes.Status409Conflict);
    }

    [Fact]
    public async Task Register_Created_sets_session_and_returns_payload()
    {
        var dto = new RegisterRequest { Email = "fresh@x.com", Password = "pass123" };

        var result = await _sut.RegisterApi(dto);

        var created = Assert.IsType<CreatedResult>(result);
        created.StatusCode.Should().Be(StatusCodes.Status201Created);

        var payload = Assert.IsType<RegisterResponse>(created.Value);
        payload.Email.Should().Be("fresh@x.com");
        payload.Id.Should().BeGreaterThan(0);
        payload.IsAdmin.Should().BeFalse();

        // session set
        var sessionUserId = _http.Session.GetInt32("SessionUserId");
        sessionUserId.Should().Be(payload.Id);

        // persisted in db
        var user = await _db.Users.AsNoTracking().SingleAsync(u => u.Id == payload.Id);
        _passwords.Verify("pass123", user.PasswordHash!).Should().BeTrue();
    }

    // ---------- LOGIN (JSON) ----------

    [Fact]
    public async Task Login_Unauthorized_when_user_missing()
    {
        var result = await _sut.LoginApi(new LoginRequest { Email = "nope@x.com", Password = "p" });

        var unauthorized = Assert.IsType<UnauthorizedObjectResult>(result);
        unauthorized.StatusCode.Should().Be(StatusCodes.Status401Unauthorized);
    }

    [Fact]
    public async Task Login_Unauthorized_when_wrong_password()
    {
        var email = "a@x.com";
        _db.Users.Add(new User { Email = email, PasswordHash = _passwords.Hash("correct") });
        await _db.SaveChangesAsync();

        var result = await _sut.LoginApi(new LoginRequest { Email = email, Password = "wrong" });

        var unauthorized = Assert.IsType<UnauthorizedObjectResult>(result);
        unauthorized.StatusCode.Should().Be(StatusCodes.Status401Unauthorized);
    }

    [Fact]
    public async Task Login_Ok_sets_session_and_returns_payload()
    {
        var email = "ok@x.com";
        var user = new User { Email = email, PasswordHash = _passwords.Hash("pw") };
        _db.Users.Add(user);
        await _db.SaveChangesAsync();

        var result = await _sut.LoginApi(new LoginRequest { Email = email, Password = "pw" });

        var ok = Assert.IsType<OkObjectResult>(result);
        ok.StatusCode.Should().Be(StatusCodes.Status200OK);

        var payload = Assert.IsType<LoginResponse>(ok.Value);
        payload.Email.Should().Be(email);
        payload.Id.Should().Be(user.Id);
        payload.IsAdmin.Should().BeFalse();

        _http.Session.GetInt32("SessionUserId").Should().Be(user.Id);
    }

    // ---------- ME ----------

    [Fact]
    public async Task Me_Unauthorized_when_no_session()
    {
        var result = await _sut.Me();
        Assert.IsType<UnauthorizedResult>(result);
    }

    [Fact]
    public async Task Me_Ok_when_session_present()
    {
        var u = new User { Email = "me@x.com", PasswordHash = "x" };
        _db.Users.Add(u);
        await _db.SaveChangesAsync();

        _http.Session.SetInt32("SessionUserId", u.Id);

        var result = await _sut.Me();

        var ok = Assert.IsType<OkObjectResult>(result);
        dynamic body = ok.Value!;
        Assert.Equal(u.Id, (int)body.GetType().GetProperty("Id")!.GetValue(body)!);
        Assert.Equal("me@x.com", (string)body.GetType().GetProperty("Email")!.GetValue(body)!);
    }

    // ---------- LOGOUT (JSON) ----------

    [Fact]
    public void Logout_Ok_and_clears_session()
    {
        _http.Session.SetInt32("SessionUserId", 123);

        var result = _sut.LogoutApi();

        var ok = Assert.IsType<OkObjectResult>(result);
        ok.StatusCode.Should().Be(StatusCodes.Status200OK);

        _http.Session.TryGetValue("SessionUserId", out var _).Should().BeFalse();
    }
}
