using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AquaReflect.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class ExtendPetitionStatusAndLifecycle : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "AccessPinHash",
                table: "Petitions",
                type: "character varying(128)",
                maxLength: 128,
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "ConclusionType",
                table: "Petitions",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "DuplicateOfId",
                table: "Petitions",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ForwardReason",
                table: "Petitions",
                type: "character varying(1000)",
                maxLength: 1000,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ForwardToOrganization",
                table: "Petitions",
                type: "character varying(250)",
                maxLength: 250,
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "NeedInfoCount",
                table: "Petitions",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<DateTime>(
                name: "NeedInfoDeadline",
                table: "Petitions",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "NeedInfoReason",
                table: "Petitions",
                type: "character varying(1000)",
                maxLength: 1000,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PublicSummary",
                table: "Petitions",
                type: "character varying(2000)",
                maxLength: 2000,
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

            migrationBuilder.AddColumn<DateTime>(
                name: "SlaPausedAt",
                table: "Petitions",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<double>(
                name: "TotalSlaPausedMinutes",
                table: "Petitions",
                type: "double precision",
                nullable: false,
                defaultValue: 0.0);

            migrationBuilder.AddColumn<DateTime>(
                name: "WithdrawnAt",
                table: "Petitions",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "WithdrawnReason",
                table: "Petitions",
                type: "character varying(1000)",
                maxLength: 1000,
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Petitions_DuplicateOfId",
                table: "Petitions",
                column: "DuplicateOfId");

            migrationBuilder.AddForeignKey(
                name: "FK_Petitions_Petitions_DuplicateOfId",
                table: "Petitions",
                column: "DuplicateOfId",
                principalTable: "Petitions",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Petitions_Petitions_DuplicateOfId",
                table: "Petitions");

            migrationBuilder.DropIndex(
                name: "IX_Petitions_DuplicateOfId",
                table: "Petitions");

            migrationBuilder.DropColumn(
                name: "AccessPinHash",
                table: "Petitions");

            migrationBuilder.DropColumn(
                name: "ConclusionType",
                table: "Petitions");

            migrationBuilder.DropColumn(
                name: "DuplicateOfId",
                table: "Petitions");

            migrationBuilder.DropColumn(
                name: "ForwardReason",
                table: "Petitions");

            migrationBuilder.DropColumn(
                name: "ForwardToOrganization",
                table: "Petitions");

            migrationBuilder.DropColumn(
                name: "NeedInfoCount",
                table: "Petitions");

            migrationBuilder.DropColumn(
                name: "NeedInfoDeadline",
                table: "Petitions");

            migrationBuilder.DropColumn(
                name: "NeedInfoReason",
                table: "Petitions");

            migrationBuilder.DropColumn(
                name: "PublicSummary",
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
                name: "SlaPausedAt",
                table: "Petitions");

            migrationBuilder.DropColumn(
                name: "TotalSlaPausedMinutes",
                table: "Petitions");

            migrationBuilder.DropColumn(
                name: "WithdrawnAt",
                table: "Petitions");

            migrationBuilder.DropColumn(
                name: "WithdrawnReason",
                table: "Petitions");
        }
    }
}
