namespace Control_de_viajes.Models
{
    public class TripEvent
    {
        public int Id { get; set; }
        public int TripId { get; set; }
        public string? AudioUrl { get; set; }
        public string? PhotoUrl { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
