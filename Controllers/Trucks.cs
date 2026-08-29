using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Control_de_viajes.Data; 
using Control_de_viajes.Models;

namespace Control_de_viajes.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TrucksController : ControllerBase
    {
        private readonly AppDbContext _context;

        public TrucksController(AppDbContext context)
        {
            _context = context;
        }

        //  GET: api/trucks
        [HttpGet]
        public async Task<IActionResult> GetTrucks()
        {
            var trucks = await _context.Trucks.ToListAsync();
            return Ok(trucks);
        }

        [HttpPost]
        public async Task<IActionResult> CreateTruck([FromBody] CreateTruckDto dto)
        {
            var exists = await _context.Trucks.AnyAsync(t => t.Placa.ToLower() == dto.Placa.ToLower());
            if (exists) return BadRequest(new { message = "La placa ya está registrada." });

            var newTruck = new Truck
            {
                Placa = dto.Placa.ToUpper(),
                Tipo = dto.Tipo,
                Estado = "Disponible"
            };

            _context.Trucks.Add(newTruck);
            await _context.SaveChangesAsync();

            return Ok(newTruck);
        }
    }
}
