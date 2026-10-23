using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AquaReflect.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddUnitLeadAndOnBehalfFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsUnitLead",
                table: "Users",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<Guid>(
                name: "CreatedOnBehalfByUserId",
                table: "Petitions",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "ReceptionSource",
                table: "Petitions",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateIndex(
                name: "IX_Petitions_CreatedOnBehalfByUserId",
                table: "Petitions",
                column: "CreatedOnBehalfByUserId");

            migrationBuilder.AddForeignKey(
                name: "FK_Petitions_Users_CreatedOnBehalfByUserId",
                table: "Petitions",
                column: "CreatedOnBehalfByUserId",
                principalTable: "Users",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Petitions_Users_CreatedOnBehalfByUserId",
                table: "Petitions");

            migrationBuilder.DropIndex(
                name: "IX_Petitions_CreatedOnBehalfByUserId",
                table: "Petitions");

            migrationBuilder.DropColumn(
                name: "IsUnitLead",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "CreatedOnBehalfByUserId",
                table: "Petitions");

            migrationBuilder.DropColumn(
                name: "ReceptionSource",
                table: "Petitions");
        }
    }
}
