public class TripPhoto
{
    public int Id { get; set; }

    public int TripId { get; set; }

    public string Url { get; set; }

    public string Type { get; set; }

    public DateTime CreatedAt { get; set; }

    // GPS
    public double? Latitude { get; set; }

    public double? Longitude { get; set; }

    public DateTime? CaptureDate { get; set; }
}