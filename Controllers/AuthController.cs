using Microsoft.AspNetCore.Mvc;
using Control_de_viajes.Data;
using Control_de_viajes.Models;
using System.Linq;

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
        public IActionResult Login([FromBody] LoginRequest loginUser)
        {
            var user = _context.Users
                .FirstOrDefault(u =>
                    u.Username == loginUser.Username &&
                    u.Password == loginUser.Password);

            if (user == null)
            {
                return Unauthorized(new { message = "Credenciales incorrectas" });
            }

            return Ok(new
            {
                name = user.Name,
                role = user.Role,
                token = "fake-jwt-token"
            });
        
        }
    }
}