using Control_de_viajes.Models;
using System.ComponentModel.DataAnnotations;
using System.Diagnostics;

public class Trip
{
    public int Id { get; set; }

    public string Nro { get; set; }

    [Required]
    public string Origin { get; set; }

    [Required]
    public string Destination { get; set; }

    [Required]
    public string DriverName { get; set; }


    public string? Status { get; set; } 

    public int TractoId { get; set; }
    public int SemiremolqueId { get; set; }

    public Truck? Tracto { get; set; } 
    public Truck? Semiremolque { get; set; } 

    public DateTime CreatedAt { get; set; }
   

  
    public DateTime? StartDate { get; set; } = DateTime.UtcNow;
    public DateTime? EndDate { get; set; }

    public List<TripPhoto> Photos { get; set; } = new();
    public List<TripEvent> Events { get; set; } = new();
}