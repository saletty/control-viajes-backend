using Control_de_viajes.Data;
using Control_de_viajes.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;



namespace Control_de_viajes.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TripsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public TripsController(AppDbContext context)
        {
            _context = context;
        }

        // =========================
        // CREAR VIAJE
        // =========================
        [HttpPost]
        public async Task<IActionResult> CreateTrip([FromBody] Trip trip)
        {
            try
            {
                trip.CreatedAt = DateTime.UtcNow;
                trip.Status = "Pendiente";

                var tracto = await _context.Trucks.FindAsync(trip.TractoId);
                var semi = await _context.Trucks.FindAsync(trip.SemiremolqueId);

                if (tracto == null || semi == null)
                    return BadRequest("Camión no válido");

                if (tracto.Estado == "EnUso" || semi.Estado == "EnUso")
                    return BadRequest("Uno de los camiones ya está en uso");

                _context.Trips.Add(trip);

                tracto.Estado = "EnUso";
                semi.Estado = "EnUso";

                await _context.SaveChangesAsync();

                return Ok(trip);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        // =========================
        // LISTAR VIAJES
        // =========================
        [HttpGet]
        public IActionResult GetTrips(
            string? nro,
            string? driver,
            string? status,
            string? tracto,
            string? semiremolque)
        {
            var query = _context.Trips
                .Include(t => t.Tracto)
                .Include(t => t.Semiremolque)
                .AsQueryable();

            if (!string.IsNullOrEmpty(nro))
                query = query.Where(t => t.Nro.Contains(nro));

            if (!string.IsNullOrEmpty(driver))
                query = query.Where(t => t.DriverName.Contains(driver));

            if (!string.IsNullOrEmpty(tracto))
                query = query.Where(t => t.Tracto != null && t.Tracto.Placa.Contains(tracto));

            if (!string.IsNullOrEmpty(semiremolque))
                query = query.Where(t => t.Semiremolque != null && t.Semiremolque.Placa.Contains(semiremolque));

            if (!string.IsNullOrEmpty(status) && status != "all")
                query = query.Where(t => t.Status == status);

            return Ok(query.ToList());
        }

        // =========================
        // INICIAR VIAJE
        // =========================
        [HttpPut("{id}/start")]
        public async Task<IActionResult> StartTrip(int id)
        {
            var trip = await _context.Trips.FindAsync(id);
            if (trip == null) return NotFound("Viaje no encontrado");

            trip.Status = "EnRuta";
            trip.StartDate = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok("Viaje iniciado");
        }

        // =========================
        // FINALIZAR VIAJE → REVISION
        // =========================
        [HttpPut("{id}/finish")]
        public async Task<IActionResult> FinishTrip(int id)
        {
            try
            {
                var trip = await _context.Trips.FindAsync(id);
                if (trip == null) return NotFound("Viaje no encontrado");

                // CAMBIO AQUÍ: De "Revision" a "Aprobado"
                trip.Status = "Aprobado";
                trip.EndDate = DateTime.UtcNow;

                var tracto = await _context.Trucks.FindAsync(trip.TractoId);
                var semi = await _context.Trucks.FindAsync(trip.SemiremolqueId);

                if (tracto != null) tracto.Estado = "Disponible";
                if (semi != null) semi.Estado = "Disponible";

                await _context.SaveChangesAsync();

                return Ok("Viaje aprobado con éxito");
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [HttpPut("{id}/approve")]
        public async Task<IActionResult> ApproveTrip(int id)
        {
            try
            {
                var trip = await _context.Trips.FindAsync(id);
                if (trip == null) return NotFound("Viaje no encontrado");

                trip.Status = "Aprobado";
                trip.EndDate = DateTime.UtcNow;

                // Liberar vehículos
                var tracto = await _context.Trucks.FindAsync(trip.TractoId);
                var semi = await _context.Trucks.FindAsync(trip.SemiremolqueId);

                if (tracto != null) tracto.Estado = "Disponible";
                if (semi != null) semi.Estado = "Disponible";

                await _context.SaveChangesAsync();
                return Ok("Viaje aprobado");
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        // =========================
        // RECHAZAR VIAJE
        // =========================
        [HttpPut("{id}/reject")]
        public async Task<IActionResult> RejectTrip(int id)
        {
            try
            {
                var trip = await _context.Trips.FindAsync(id);
                if (trip == null) return NotFound("Viaje no encontrado");

                trip.Status = "Rechazado";
                trip.EndDate = DateTime.UtcNow;

                var tracto = await _context.Trucks.FindAsync(trip.TractoId);
                var semi = await _context.Trucks.FindAsync(trip.SemiremolqueId);

                if (tracto != null) tracto.Estado = "Disponible";
                if (semi != null) semi.Estado = "Disponible";

                await _context.SaveChangesAsync();

                return Ok("Viaje rechazado");
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        // =========================
        // VIAJES DRIVER
        // =========================
        [HttpGet("driver/{name}")]
        public async Task<IActionResult> GetDriverTrips(string name)
        {
            var trips = await _context.Trips
                .Include(t => t.Tracto)
                .Include(t => t.Semiremolque)
                .Where(t => t.DriverName == name)
                .ToListAsync();

            return Ok(trips);
        }


    }
}