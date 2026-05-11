using Control_de_viajes.Data;
using Control_de_viajes.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Control_de_viajes.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TripVideosController : ControllerBase
    {
        private readonly AppDbContext _context;

        public TripVideosController(AppDbContext context)
        {
            _context = context;
        }

        // ==========================================
        // SUBIR VIDEO (SALIDA o LLEGADA)
        // ==========================================
        [HttpPost("{tripId}")]
        [RequestSizeLimit(104857600)] // Límite de 100MB a nivel de método
        public async Task<IActionResult> UploadVideo(int tripId, [FromForm] IFormFile file, [FromQuery] string type)
        {
            try
            {
                if (file == null || file.Length == 0)
                    return BadRequest("No se recibió ningún video.");

                // Validación de seguridad (100MB) para asegurar el minuto de duración
                if (file.Length > 100 * 1024 * 1024)
                    return BadRequest("El video excede el límite permitido de 100MB.");

                // 1. Preparar carpeta física: wwwroot/uploads/videos
                string folderPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads", "videos");
                if (!Directory.Exists(folderPath))
                    Directory.CreateDirectory(folderPath);

                // 2. Generar nombre único con GUID para evitar sobrescritura
                string extension = Path.GetExtension(file.FileName);
                if (string.IsNullOrEmpty(extension)) extension = ".mp4"; // Default

                string fileName = $"{Guid.NewGuid()}{extension}";
                string filePath = Path.Combine(folderPath, fileName);

                // 3. Guardar el archivo en el servidor
                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }

                // 4. Guardar referencia en Base de Datos
                var tripVideo = new TripVideo
                {
                    TripId = tripId,
                    Url = $"/uploads/videos/{fileName}",
                    Type = type.ToUpper(), // SALIDA o LLEGADA
                    CreatedAt = DateTime.UtcNow
                };

                _context.TripVideos.Add(tripVideo);
                await _context.SaveChangesAsync();

                return Ok(tripVideo);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error en el servidor de Terranera: {ex.Message}");
            }
        }

        // ==========================================
        // OBTENER VIDEOS DE UN VIAJE
        // ==========================================
        [HttpGet("{tripId}")]
        public async Task<IActionResult> GetVideosByTrip(int tripId)
        {
            var videos = await _context.TripVideos
                .Where(v => v.TripId == tripId)
                .OrderByDescending(v => v.CreatedAt)
                .ToListAsync();

            return Ok(videos);
        }
    }
}
