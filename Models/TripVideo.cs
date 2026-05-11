namespace Control_de_viajes.Models
{
    public class TripVideo
    {
        public int Id { get; set; }
        public int TripId { get; set; }
        public string Url { get; set; }
        public string Type { get; set; } // SALIDA o LLEGADA
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}