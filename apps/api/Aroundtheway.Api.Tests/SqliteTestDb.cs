// apps/api/Aroundtheway.Api.Tests/SqliteTestDb.cs
using Aroundtheway.Api.Data;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;

namespace Aroundtheway.Api.Tests;

public sealed class SqliteTestDb : IDisposable, IAsyncDisposable
{
    public SqliteConnection Connection { get; }
    public AppDbContext Db { get; }

    public SqliteTestDb()
    {
        Connection = new SqliteConnection("DataSource=:memory:");
        Connection.Open();

        var opts = new DbContextOptionsBuilder<AppDbContext>()
            .UseSqlite(Connection)
            .Options;

        Db = new AppDbContext(opts);
        Db.Database.EnsureCreated();
    }

    public void Dispose()
    {
        Db.Dispose();
        Connection.Dispose();
    }

    public ValueTask DisposeAsync()
    {
        return new ValueTask(Task.WhenAll(Db.DisposeAsync().AsTask(), Connection.DisposeAsync().AsTask()));
    }
}
