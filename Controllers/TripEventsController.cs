using Microsoft.AspNetCore.Mvc;
using Control_de_viajes.Data;
using Control_de_viajes.Models;
using Microsoft.EntityFrameworkCore;

namespace Control_de_viajes.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TripEventsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public TripEventsController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/TripEvents/{tripId}
        [HttpGet("{tripId}")]
        public async Task<IActionResult> GetEvents(int tripId)
        {
            var events = await _context.TripEvents
                .Where(e => e.TripId == tripId)
                .OrderBy(e => e.CreatedAt)
                .ToListAsync();
            return Ok(events);
        }

        // POST: api/TripEvents/{tripId}
        [HttpPost("{tripId}")]
        public async Task<IActionResult> UploadAudio(int tripId, IFormFile audio)
        {
            if (audio == null || audio.Length == 0)
                return BadRequest("No hay audio");

            // 1. Validar límite directamente en la base de datos
            var count = await _context.TripEvents.CountAsync(e => e.TripId == tripId);
            if (count >= 2)
                return BadRequest("Máximo 2 audios permitidos por viaje");

            // 2. Guardar archivo
            var fileName = $"{Guid.NewGuid()}.webm";
            var uploadsPath = Path.Combine(Directory.GetCurrentDirectory(), "uploads");

            if (!Directory.Exists(uploadsPath))
                Directory.CreateDirectory(uploadsPath);

            var path = Path.Combine(uploadsPath, fileName);
            using (var stream = new FileStream(path, FileMode.Create))
            {
                await audio.CopyToAsync(stream);
            }

            // 3. Guardar en BD
            var evento = new TripEvent
            {
                TripId = tripId,
                AudioUrl = "/uploads/" + fileName,
                CreatedAt = DateTime.UtcNow
            };

            _context.TripEvents.Add(evento);
            await _context.SaveChangesAsync();

            return Ok(evento);
        }
    }
}
