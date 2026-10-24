using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AquaReflect.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddInspectionReportAndPendingApprovalStatus : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "InspectionRejectionReason",
                table: "Petitions",
                type: "character varying(2000)",
                maxLength: 2000,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "InspectionReport",
                table: "Petitions",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "InspectionReportApprovedAt",
                table: "Petitions",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "InspectionReportApprovedByUserId",
                table: "Petitions",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "InspectionReportSubmittedAt",
                table: "Petitions",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "InspectionReportSubmittedByUserId",
                table: "Petitions",
                type: "uuid",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "InspectionRejectionReason",
                table: "Petitions");

            migrationBuilder.DropColumn(
                name: "InspectionReport",
                table: "Petitions");

            migrationBuilder.DropColumn(
                name: "InspectionReportApprovedAt",
                table: "Petitions");

            migrationBuilder.DropColumn(
                name: "InspectionReportApprovedByUserId",
                table: "Petitions");

            migrationBuilder.DropColumn(
                name: "InspectionReportSubmittedAt",
                table: "Petitions");

            migrationBuilder.DropColumn(
                name: "InspectionReportSubmittedByUserId",
                table: "Petitions");
        }
    }
}
