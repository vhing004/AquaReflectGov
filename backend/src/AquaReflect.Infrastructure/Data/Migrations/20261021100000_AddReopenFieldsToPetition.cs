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
            migrationBuilder.AddColumn<int>(
                name: "CsatScore",
                table: "Petitions",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "ReopenCount",
                table: "Petitions",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "ReopenReason",
                table: "Petitions",
                type: "character varying(1000)",
                maxLength: 1000,
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "ReopenedAt",
                table: "Petitions",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "ReopenStatus",
                table: "Petitions",
                type: "integer",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CsatScore",
                table: "Petitions");

            migrationBuilder.DropColumn(
                name: "ReopenCount",
                table: "Petitions");

            migrationBuilder.DropColumn(
                name: "ReopenReason",
                table: "Petitions");

            migrationBuilder.DropColumn(
                name: "ReopenedAt",
                table: "Petitions");

            migrationBuilder.DropColumn(
                name: "ReopenStatus",
                table: "Petitions");
        }
    }
}
