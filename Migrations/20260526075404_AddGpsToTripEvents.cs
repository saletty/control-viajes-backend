using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Control_de_viajes.Migrations
{
    /// <inheritdoc />
    public partial class AddGpsToTripEvents : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "CaptureDate",
                table: "TripEvents",
                type: "timestamp with time zone",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CaptureDate",
                table: "TripEvents");
        }
    }
}
