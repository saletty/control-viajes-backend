using Microsoft.AspNetCore.Mvc;
using Control_de_viajes.Data;
using Control_de_viajes.Models;
using CloudinaryDotNet;
using CloudinaryDotNet.Actions;

namespace Control_de_viajes.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TripPhotosController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly Cloudinary _cloudinary;


        public TripPhotosController(AppDbContext context, Cloudinary cloudinary)
        {
            _context = context;
            _cloudinary = cloudinary;
        }

        // ==============================
        //  SUBIR FOTO
        // ==============================
        [HttpPost("{tripId}")]
        [DisableRequestSizeLimit]
        public async Task<IActionResult> UploadPhoto(int tripId, IFormFile file, [FromQuery] string type)
        {
            if (file == null || file.Length == 0)
                return BadRequest("No se envió ningún archivo");

            try
            {
                await using var stream = file.OpenReadStream();

                var uploadParams = new ImageUploadParams()
                {
                    File = new FileDescription(file.FileName, stream),
                    Folder = "trips/photos"
                };

                var uploadResult = await _cloudinary.UploadAsync(uploadParams);

                if (uploadResult.StatusCode != System.Net.HttpStatusCode.OK)
                    return StatusCode(500, "Error subiendo a Cloudinary");

                var photo = new TripPhoto
                {
                    TripId = tripId,
                    Url = uploadResult.SecureUrl.ToString(), // 🔥 URL REAL
                    Type = type,
                    CreatedAt = DateTime.UtcNow
                };

                _context.TripPhotos.Add(photo);
                await _context.SaveChangesAsync();

                return Ok(photo);
            }
            catch (Exception ex)
            {
                return StatusCode(500, "Error: " + ex.Message);
            }
        }

        // ==============================
        //  OBTENER FOTOS
        // ==============================
        [HttpGet("{tripId}")]
        public IActionResult GetPhotosByTrip(int tripId)
        {
            var photos = _context.TripPhotos
                .Where(p => p.TripId == tripId)
                .OrderBy(p => p.CreatedAt)
                .ToList();

            return Ok(photos);
        }

        // ==============================
        //  ELIMINAR FOTO
        // ==============================
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeletePhoto(int id)
        {
            var photo = await _context.TripPhotos.FindAsync(id);

            if (photo == null)
                return NotFound();

            try
            {
                //  EXTRAER PUBLIC ID DESDE URL
                var uri = new Uri(photo.Url);
                var segments = uri.AbsolutePath.Split('/');
                var fileName = segments.Last();
                var publicId = "trips/photos/" + Path.GetFileNameWithoutExtension(fileName);

                var deleteParams = new DeletionParams(publicId);
                await _cloudinary.DestroyAsync(deleteParams);

                _context.TripPhotos.Remove(photo);
                await _context.SaveChangesAsync();

                return Ok("Foto eliminada");
            }
            catch (Exception ex)
            {
                return StatusCode(500, "Error eliminando: " + ex.Message);
            }
        }

        [HttpPut("update/{id}")]
        public async Task<IActionResult> UpdatePhoto(int id, [FromForm] IFormFile file)
        {
            try
            {
                var photo = await _context.TripPhotos.FindAsync(id);
                if (photo == null) return NotFound("La foto no existe.");

                if (file == null || file.Length == 0)
                    return BadRequest("No se recibió el archivo.");

                // 1. Carpeta de destino
                string folderPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads");
                if (!Directory.Exists(folderPath)) Directory.CreateDirectory(folderPath);

                // 2. Nombre de archivo único
                string fileName = $"{Guid.NewGuid()}{Path.GetExtension(file.FileName)}";
                string filePath = Path.Combine(folderPath, fileName);

                // 3. Guardar físicamente
                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }

                // 4. Actualizar el modelo (Usando CreatedAt que es el que tienes)
                photo.Url = $"/uploads/{fileName}";
                photo.CreatedAt = DateTime.UtcNow; // <--- Aquí usamos el nombre correcto

                await _context.SaveChangesAsync();

                return Ok(new { message = "Foto corregida", url = photo.Url });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error: {ex.Message}");
            }
        }
    }
}