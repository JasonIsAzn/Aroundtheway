using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Aroundtheway.Api.Data;
using Aroundtheway.Api.ViewModels;

namespace Aroundtheway.Api.Controllers
{
    [Authorize(Roles = "Admin")]
    public class DebugController : Controller
    {
        private readonly ILogger<DebugController> _logger;
        private readonly AppDbContext _context;

        public DebugController(ILogger<DebugController> logger, AppDbContext context)
        {
            _logger = logger;
            _context = context;
        }

        [HttpGet]
        public IActionResult Index()
        {
            return View();
        }
    }
}