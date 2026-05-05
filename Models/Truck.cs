namespace Control_de_viajes.Models
{
    public class Truck
    {
        public int Id { get; set; }
        public string Placa { get; set; }
        public string Tipo { get; set; } // Tracto o Semiremolque
        public string Estado { get; set; } = "Disponible";
    }
}
