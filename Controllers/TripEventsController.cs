using Microsoft.AspNetCore.Mvc;
using Control_de_viajes.Data;
using Control_de_viajes.Models;
using CloudinaryDotNet;
using CloudinaryDotNet.Actions;

namespace Control_de_viajes.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TripEventsController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly Cloudinary _cloudinary;


        public TripEventsController(AppDbContext context, Cloudinary cloudinary)
        {
            _context = context;
            _cloudinary = cloudinary;
        }

        //  SUBIR AUDIO

        [HttpPost("{tripId}")]
        public async Task<IActionResult> UploadAudio(
    int tripId,
    IFormFile? audio,
    IFormFile? photo)
        {
            try
            {
                // Debe existir al menos uno
                if (
                    (audio == null || audio.Length == 0) &&
                    (photo == null || photo.Length == 0)
                )
                {
                    return BadRequest(
                        "Debe enviar audio o foto"
                    );
                }

                string? audioUrl = null;
                string? photoUrl = null;

                // ===== AUDIO =====
                if (audio != null && audio.Length > 0)
                {
                    await using var stream =
                        audio.OpenReadStream();

                    var uploadParams =
                        new VideoUploadParams()
                        {
                            File = new FileDescription(
                                audio.FileName,
                                stream
                            ),
                            Folder = "trips/audios",
                            Format = "mp3"
                        };

                    var uploadResult =
                        await _cloudinary.UploadAsync(
                            uploadParams
                        );

                    audioUrl =
                        uploadResult.SecureUrl.ToString();
                }

                // ===== FOTO =====
                if (photo != null && photo.Length > 0)
                {
                    await using var photoStream =
                        photo.OpenReadStream();

                    var imageParams =
                        new ImageUploadParams()
                        {
                            File = new FileDescription(
                                photo.FileName,
                                photoStream
                            ),
                            Folder = "trips/eventos"
                        };

                    var imageResult =
                        await _cloudinary.UploadAsync(
                            imageParams
                        );

                    photoUrl =
                        imageResult.SecureUrl.ToString();
                }

                var ev = new TripEvent
                {
                    TripId = tripId,
                    AudioUrl = audioUrl,
                    PhotoUrl = photoUrl,
                    CreatedAt = DateTime.UtcNow
                };

                _context.TripEvents.Add(ev);

                await _context.SaveChangesAsync();

                return Ok(ev);
            }
            catch (Exception ex)
            {
                return StatusCode(
                    500,
                    ex.InnerException?.Message ?? ex.ToString()
                );
            }
        }

        //  OBTENER EVENTOS
        [HttpGet("{tripId}")]
        public IActionResult GetEvents(int tripId)
        {
            var eventsList = _context.TripEvents
                .Where(e => e.TripId == tripId)
                .OrderBy(e => e.CreatedAt)
                .ToList();

            return Ok(eventsList);
        }
    }
}
