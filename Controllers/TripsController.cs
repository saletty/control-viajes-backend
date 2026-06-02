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
                // Aseguramos UTC para PostgreSQL
                trip.CreatedAt = DateTime.UtcNow;
                trip.Status = "Pendiente";

                var tracto = await _context.Trucks.FindAsync(trip.TractoId);
                var semi = await _context.Trucks.FindAsync(trip.SemiremolqueId);

                if (tracto == null || semi == null)
                    return BadRequest("Camión o Semiremolque no válido");

                if (tracto.Estado == "EnUso" || semi.Estado == "EnUso")
                    return BadRequest("Una de las unidades ya está en uso");

                // Actualizar estado de unidades
                tracto.Estado = "EnUso";
                semi.Estado = "EnUso";

                _context.Trips.Add(trip);
                await _context.SaveChangesAsync();

                return Ok(trip);
            }
            catch (Exception ex)
            {
                var innerError = ex.InnerException?.Message ?? ex.Message;
                return StatusCode(500, $"Error al guardar en PostgreSQL: {innerError}");
            }
        }

        // =========================
        // LISTAR VIAJES (Filtros Admin)
        // =========================
        [HttpGet]
        public async Task<IActionResult> GetTrips(
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

            var result = await query
                .OrderByDescending(t => t.CreatedAt)
                .Select(t => new
                {
                    t.Id,
                    t.Nro,
                    t.DriverName,
                    t.Origin,
                    t.Destination,
                    t.Status,
                    t.StartDate,
                    t.Tracto,
                    t.Semiremolque,

                    HasEvents = _context.TripEvents
                        .Any(e => e.TripId == t.Id)
                })
                .ToListAsync();

                        return Ok(result);
        }

        // =========================
        // INICIAR VIAJE (Chofer)
        // =========================
        [HttpPut("{id}/start")]
        public async Task<IActionResult> StartTrip(int id)
        {
            var trip = await _context.Trips.FindAsync(id);
            if (trip == null) return NotFound("Viaje no encontrado");

            trip.Status = "EnRuta";
            trip.StartDate = DateTime.UtcNow; // UTC obligatorio

            await _context.SaveChangesAsync();
            return Ok("Viaje iniciado correctamente.");
        }

        // ==========================================
        // FINALIZAR VIAJE (Chofer -> Revisión)
        // ==========================================
        [HttpPut("{id}/finish")]
        public async Task<IActionResult> FinishTrip(int id)
        {
            var trip = await _context.Trips.FindAsync(id);
            if (trip == null) return NotFound("Viaje no encontrado");

            trip.Status = "Revision";
            trip.EndDate = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return Ok("Evidencias enviadas. El viaje está en revisión.");
        }

        // ==========================================
        // APROBAR VIAJE (Admin -> Libera Camiones)
        // ==========================================
        [HttpPut("{id}/approve")]
        public async Task<IActionResult> ApproveTrip(int id)
        {
            var trip = await _context.Trips.FindAsync(id);
            if (trip == null) return NotFound("Viaje no encontrado");

            trip.Status = "Aprobado";
            if (trip.EndDate == null) trip.EndDate = DateTime.UtcNow;

            // Liberación de Unidades para Cobramet
            var tracto = await _context.Trucks.FindAsync(trip.TractoId);
            var semi = await _context.Trucks.FindAsync(trip.SemiremolqueId);

            if (tracto != null) tracto.Estado = "Disponible";
            if (semi != null) semi.Estado = "Disponible";

            await _context.SaveChangesAsync();
            return Ok("Viaje aprobado y unidades liberadas.");
        }

        // ==========================================
        // RECHAZAR VIAJE (Admin -> Chofer corrige)
        // ==========================================
        [HttpPut("{id}/reject")]
        public async Task<IActionResult> RejectTrip(int id)
        {
            var trip = await _context.Trips.FindAsync(id);
            if (trip == null) return NotFound("Viaje no encontrado");

            trip.Status = "Rechazado";
            // Las unidades NO se liberan hasta que el chofer corrija las fotos/videos

            await _context.SaveChangesAsync();
            return Ok("Viaje rechazado para corrección.");
        }

        // =========================
        // VIAJES DEL CHOFER
        // =========================
        [HttpGet("driver/{name}")]
        public async Task<IActionResult> GetDriverTrips(string name)
        {
            var trips = await _context.Trips
                .Include(t => t.Tracto)
                .Include(t => t.Semiremolque)
                .Where(t => t.DriverName == name)
                .OrderByDescending(t => t.CreatedAt)
                .ToListAsync();

            return Ok(trips);
        }
    }
}