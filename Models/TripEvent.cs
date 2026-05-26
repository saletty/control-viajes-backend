namespace Control_de_viajes.Models
{
    public class TripEvent
    {
        public int Id { get; set; }
        public int TripId { get; set; }
        public string? AudioUrl { get; set; }
        public string? PhotoUrl { get; set; }
        public string? Reason { get; set; }
        public string? Observation { get; set; }
        public double? Latitude { get; set; }
        public double? Longitude { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}