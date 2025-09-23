using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Aroundtheway.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddProductIdSlug : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ProductId",
                table: "Posts",
                type: "longtext",
                nullable: false)
                .Annotation("MySql:CharSet", "utf8mb4");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ProductId",
                table: "Posts");
        }
    }
}
