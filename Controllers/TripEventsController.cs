using Microsoft.AspNetCore.Mvc;
using Control_de_viajes.Data;
using Control_de_viajes.Models;

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

        [HttpPost("{tripId}")]
        public async Task<IActionResult> UploadAudio(int tripId, IFormFile audio)
        {
            if (audio == null || audio.Length == 0)
                return BadRequest("No hay audio");

            var fileName = Guid.NewGuid() + Path.GetExtension(audio.FileName);
            var uploadsPath = Path.Combine(Directory.GetCurrentDirectory(), "uploads");

            // Crear carpeta si no existe
            if (!Directory.Exists(uploadsPath))
                Directory.CreateDirectory(uploadsPath);

            var path = Path.Combine(uploadsPath, fileName);

            using (var stream = new FileStream(path, FileMode.Create))
            {
                await audio.CopyToAsync(stream);
            }

            var evento = new TripEvent
            {
                TripId = tripId,
                AudioUrl = "/uploads/" + fileName,
                CreatedAt = DateTime.UtcNow // 🔥 IMPORTANTE
            };

            _context.TripEvents.Add(evento);
            await _context.SaveChangesAsync();

            return Ok(evento);
        }
    }
}
