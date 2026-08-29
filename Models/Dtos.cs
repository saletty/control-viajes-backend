namespace Control_de_viajes.Models
{
    // DTO para crear vehículos (Tractor / Semiremolque)
    public class CreateTruckDto
    {
        public string Placa { get; set; } = string.Empty;
        public string Tipo { get; set; } = string.Empty;
    }

    // DTO para crear choferes + cuenta
    public class CreateDriverDto
{
    public string FullName { get; set; } = string.Empty; 
    public string Carnet { get; set; } = string.Empty;   
}
    // DTO para editar viajes
    public class UpdateTripDto
    {
        public string Nro { get; set; } = string.Empty;
        public string Origin { get; set; } = string.Empty;
        public string Destination { get; set; } = string.Empty;
        public string DriverName { get; set; } = string.Empty;
        public int TruckId { get; set; }
        public int? SemiId { get; set; }
    }
}