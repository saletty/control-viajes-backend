using Microsoft.EntityFrameworkCore;
using Control_de_viajes.Models;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;

namespace Control_de_viajes.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options)
            : base(options)
        {
        }

        public DbSet<User> Users { get; set; }
        public DbSet<Trip> Trips { get; set; }
        public DbSet<Truck> Trucks { get; set; }
        public DbSet<TripPhoto> TripPhotos { get; set; }
        public DbSet<TripEvent> TripEvents { get; set; }
        public DbSet<TripVideo> TripVideos { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Índice para login admin (búsqueda por Username)
            modelBuilder.Entity<User>()
                .HasIndex(u => u.Username)
                .HasDatabaseName("IX_Users_Username");

            // Índice para login conductor (búsqueda por Role + Password/Carnet)
            modelBuilder.Entity<User>()
                .HasIndex(u => new { u.Role, u.Password })
                .HasDatabaseName("IX_Users_Role_Password");

            // CONFIGURACIÓN PARA POSTGRESQL: 
            // Convierte automáticamente todos los DateTime a UTC para evitar el error de 'Kind=Unspecified'
            var dateTimeConverter = new ValueConverter<DateTime, DateTime>(
                v => v.Kind == DateTimeKind.Utc ? v : DateTime.SpecifyKind(v, DateTimeKind.Utc),
                v => v.Kind == DateTimeKind.Utc ? v : DateTime.SpecifyKind(v, DateTimeKind.Utc));

            var nullableDateTimeConverter = new ValueConverter<DateTime?, DateTime?>(
                v => !v.HasValue ? v : (v.Value.Kind == DateTimeKind.Utc ? v : DateTime.SpecifyKind(v.Value, DateTimeKind.Utc)),
                v => !v.HasValue ? v : (v.Value.Kind == DateTimeKind.Utc ? v : DateTime.SpecifyKind(v.Value, DateTimeKind.Utc)));

            foreach (var entityType in modelBuilder.Model.GetEntityTypes())
            {
                foreach (var property in entityType.GetProperties())
                {
                    if (property.ClrType == typeof(DateTime))
                    {
                        property.SetValueConverter(dateTimeConverter);
                    }
                    else if (property.ClrType == typeof(DateTime?))
                    {
                        property.SetValueConverter(nullableDateTimeConverter);
                    }
                }
            }
        }
    }
}