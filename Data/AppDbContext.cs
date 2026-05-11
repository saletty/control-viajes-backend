using Microsoft.EntityFrameworkCore;
using Control_de_viajes.Models;
using Microsoft.EntityFrameworkCore;
using Control_de_viajes.Models;

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
    }
}