using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Control_de_viajes.Data;
using Control_de_viajes.Models;

namespace Control_de_viajes.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly AppDbContext _context;

        public AuthController(AppDbContext context)
        {
            _context = context;
        }

        [HttpPost("create-driver")]
        public async Task<IActionResult> CreateDriver([FromBody] CreateDriverDto dto)
        {
            // 1. Validar que no exista un usuario registrado con ese mismo carnet (Password)
            var carnetExists = await _context.Users.AnyAsync(u => u.Password == dto.Carnet.Trim());
            if (carnetExists) 
            {
                return BadRequest(new { message = "Ya existe un conductor registrado con este Carnet/CI." });
            }

            // 2. Extraer solo el primer nombre para el Username de inicio de sesión
            var firstName = dto.FullName.Trim().Split(' ')[0];

            // 3. Crear el nuevo usuario conductor
            var newUser = new User
            {
                Username = firstName,  
                Password = dto.Carnet.Trim(),
                Name = dto.FullName.Trim(),
                Role = "Driver"
            };

            _context.Users.Add(newUser);
            await _context.SaveChangesAsync();

            return Ok(new { 
                message = "Conductor registrado con éxito.", 
                user = new {
                    newUser.Id,
                    newUser.Username,
                    newUser.Name,
                    newUser.Role
                }
            });
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest loginUser)
        {
            try
            {
                var user = await _context.Users
                    .FirstOrDefaultAsync(u =>
                        u.Username == loginUser.Username &&
                        u.Password == loginUser.Password);

                if (user == null)
                    return Unauthorized(new { message = "Credenciales incorrectas" });

                return Ok(new
                {
                    name = user.Name,
                    role = user.Role,
                    token = "fake-jwt-token"
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [HttpGet("conductors")]
        public async Task<IActionResult> GetConductors()
        {
            try
            {
                var conductors = await _context.Users
                    .Where(u => u.Role == "Conductor")
                    .OrderBy(u => u.Name)
                    .Select(u => new { u.Id, u.Name })
                    .ToListAsync();

                var activeDriverNames = await _context.Trips
                    .Where(t => t.Status == "Pendiente" ||
                        t.Status == "EnRuta" ||
                        t.Status == "Revision")
                    .Select(t => t.DriverName)
                    .Distinct()
                    .ToListAsync();

                var result = conductors.Select(c => new
                {
                    c.Id,
                    c.Name,
                    InUse = activeDriverNames.Contains(c.Name)
                });

                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [HttpPost("login-driver")]
        public async Task<IActionResult> LoginDriver([FromBody] DriverLoginRequest request)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(request?.Carnet))
                    return Unauthorized(new { message = "Carnet incorrecto" });

                var user = await _context.Users
                    .FirstOrDefaultAsync(u =>
                        u.Password == request.Carnet.Trim() &&
                        u.Role == "Conductor");

                if (user == null)
                    return Unauthorized(new { message = "Carnet incorrecto" });

                return Ok(new
                {
                    name = user.Name,
                    role = "Conductor",
                    token = "fake-jwt-token"
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }
    }
}