using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Control_de_viajes.Migrations
{
    /// <inheritdoc />
    public partial class AddPhotoToTripEvent : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "PhotoUrl",
                table: "TripEvents",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "PhotoUrl",
                table: "TripEvents");
        }
    }
}
