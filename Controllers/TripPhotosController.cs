using Microsoft.AspNetCore.Mvc;
using Control_de_viajes.Data;
using Control_de_viajes.Models;

namespace Control_de_viajes.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TripPhotosController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IWebHostEnvironment _env;

        public TripPhotosController(AppDbContext context, IWebHostEnvironment env)
        {
            _context = context;
            _env = env;
        }

        // 📸 SUBIR FOTO
        [HttpPost("{tripId}")]
        public async Task<IActionResult> UploadPhoto(int tripId, IFormFile file, string type)
        {
            if (file == null || file.Length == 0)
                return BadRequest("No se envió ningún archivo");

            var uploadsPath = Path.Combine(_env.WebRootPath, "uploads");

            if (!Directory.Exists(uploadsPath))
                Directory.CreateDirectory(uploadsPath);

            var fileName = Guid.NewGuid() + Path.GetExtension(file.FileName);
            var filePath = Path.Combine(uploadsPath, fileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            var photo = new TripPhoto
            {
                TripId = tripId,
                Url = "/uploads/" + fileName,
                Type = type,
                CreatedAt = DateTime.UtcNow // 🔥 CLAVE
            };

            _context.TripPhotos.Add(photo);
            await _context.SaveChangesAsync();

            return Ok(photo);
        }

        // 📸 OBTENER FOTOS
        [HttpGet("{tripId}")]
        public IActionResult GetPhotosByTrip(int tripId)
        {
            var photos = _context.TripPhotos
                .Where(p => p.TripId == tripId)
                .OrderBy(p => p.CreatedAt)
                .ToList();

            return Ok(photos);
        }

        // ❌ ELIMINAR FOTO
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeletePhoto(int id)
        {
            var photo = await _context.TripPhotos.FindAsync(id);

            if (photo == null)
                return NotFound();

            var filePath = Path.Combine(_env.WebRootPath, photo.Url.TrimStart('/'));

            if (System.IO.File.Exists(filePath))
            {
                System.IO.File.Delete(filePath);
            }

            _context.TripPhotos.Remove(photo);
            await _context.SaveChangesAsync();

            return Ok("Foto eliminada");
        }
    }
}