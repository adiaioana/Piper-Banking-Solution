using Microsoft.AspNetCore.Mvc;
using server_solution.Domain;
using server_solution.Services;

namespace server_solution.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class MapsController : ControllerBase
    {
        private readonly ILogger<MapsController> _logger;
        private readonly GoogleMapsService _googleMapsService;

        public MapsController(ILogger<MapsController> logger, GoogleMapsService googleMapsService)
        {
            _logger = logger;
            _googleMapsService = googleMapsService;
        }

        [HttpGet("nearby")]
        public async Task<IActionResult> GetNearbyLocations([FromQuery] LocationRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                _logger.LogInformation($"Received location request - Lat: {request.Latitude}, Long: {request.Longitude}");

                var locations = await _googleMapsService.GetNearbyATMsAsync(request);
                return Ok(locations);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing location request");
                return StatusCode(500, "An error occurred while processing your request");
            }
        }
    }
} 