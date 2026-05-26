using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Control_de_viajes.Migrations
{
    /// <inheritdoc />
    public partial class AddGpsAndEventFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<double>(
                name: "Latitude",
                table: "TripEvents",
                type: "double precision",
                nullable: true);

            migrationBuilder.AddColumn<double>(
                name: "Longitude",
                table: "TripEvents",
                type: "double precision",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Observation",
                table: "TripEvents",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Reason",
                table: "TripEvents",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Latitude",
                table: "TripEvents");

            migrationBuilder.DropColumn(
                name: "Longitude",
                table: "TripEvents");

            migrationBuilder.DropColumn(
                name: "Observation",
                table: "TripEvents");

            migrationBuilder.DropColumn(
                name: "Reason",
                table: "TripEvents");
        }
    }
}
