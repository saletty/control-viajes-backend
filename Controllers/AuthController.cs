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