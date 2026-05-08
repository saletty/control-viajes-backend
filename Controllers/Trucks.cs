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
    }
}
