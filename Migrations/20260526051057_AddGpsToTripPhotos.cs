using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Control_de_viajes.Migrations
{
    /// <inheritdoc />
    public partial class AddGpsToTripPhotos : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "CaptureDate",
                table: "TripPhotos",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<double>(
                name: "Latitude",
                table: "TripPhotos",
                type: "double precision",
                nullable: true);

            migrationBuilder.AddColumn<double>(
                name: "Longitude",
                table: "TripPhotos",
                type: "double precision",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CaptureDate",
                table: "TripPhotos");

            migrationBuilder.DropColumn(
                name: "Latitude",
                table: "TripPhotos");

            migrationBuilder.DropColumn(
                name: "Longitude",
                table: "TripPhotos");
        }
    }
}
