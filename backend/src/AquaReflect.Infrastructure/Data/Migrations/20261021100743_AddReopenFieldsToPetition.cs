using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AquaReflect.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddReopenFieldsToPetition : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "ClosedAt",
                table: "Petitions",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "CsatScore",
                table: "Petitions",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "ReopenStatus",
                table: "Petitions",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "ReworkCount",
                table: "Petitions",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "ReworkReason",
                table: "Petitions",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ClosedAt",
                table: "Petitions");

            migrationBuilder.DropColumn(
                name: "CsatScore",
                table: "Petitions");

            migrationBuilder.DropColumn(
                name: "ReopenStatus",
                table: "Petitions");

            migrationBuilder.DropColumn(
                name: "ReworkCount",
                table: "Petitions");

            migrationBuilder.DropColumn(
                name: "ReworkReason",
                table: "Petitions");
        }
    }
}
