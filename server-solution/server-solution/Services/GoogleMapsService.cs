using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using Microsoft.Extensions.Configuration;
using server_solution.Domain;

namespace server_solution.Services
{
    public class GoogleMapsService
    {
        private readonly HttpClient _httpClient;
        private readonly string _apiKey;
        private readonly ILogger<GoogleMapsService> _logger;

        public GoogleMapsService(IConfiguration configuration, ILogger<GoogleMapsService> logger)
        {
            _httpClient = new HttpClient();
            _apiKey = configuration["GoogleMaps:ApiKey"] ?? throw new ArgumentNullException("GoogleMaps:ApiKey configuration is missing");
            _logger = logger;
        }

        public async Task<IEnumerable<object>> GetNearbyATMsAsync(LocationRequest request)
        {
            try
            {
                var searchRequest = new
                {
                    maxResultCount = 10,
                    locationRestriction = new
                    {
                        circle = new
                        {
                            center = new
                            {
                                latitude = request.Latitude,
                                longitude = request.Longitude
                            },
                            radius = 500.0
                        }
                    }
                };

                var options = new JsonSerializerOptions
                {
                    PropertyNamingPolicy = JsonNamingPolicy.CamelCase
                };
                
                var jsonRequest = JsonSerializer.Serialize(searchRequest, options);
                _logger.LogInformation($"Request payload: {jsonRequest}");
                
                var content = new StringContent(jsonRequest, Encoding.UTF8, "application/json");

                _httpClient.DefaultRequestHeaders.Clear();
                _httpClient.DefaultRequestHeaders.Add("X-Goog-Api-Key", _apiKey);
                _httpClient.DefaultRequestHeaders.Add("X-Goog-FieldMask", "places.displayName,places.formattedAddress,places.id,places.location");
                _httpClient.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

                _logger.LogInformation($"Request URL: https://places.googleapis.com/v1/places:searchNearby");
                _logger.LogInformation($"Request Headers: {string.Join(", ", _httpClient.DefaultRequestHeaders.Select(h => $"{h.Key}: {string.Join(", ", h.Value)}"))}");
                
                var response = await _httpClient.PostAsync("https://places.googleapis.com/v1/places:searchNearby", content);
                
                _logger.LogInformation($"Response status code: {response.StatusCode}");
                _logger.LogInformation($"Response headers: {string.Join(", ", response.Headers.Select(h => $"{h.Key}: {string.Join(", ", h.Value)}"))}");
                
                if (!response.IsSuccessStatusCode)
                {
                    var errorContent = await response.Content.ReadAsStringAsync();
                    _logger.LogError($"API Error: {errorContent}");
                    throw new Exception($"Google Places API returned {response.StatusCode}: {errorContent}");
                }

                var responseContent = await response.Content.ReadAsStringAsync();
                _logger.LogInformation($"Response content: {responseContent}");

                if (string.IsNullOrEmpty(responseContent))
                {
                    _logger.LogWarning("Received empty response from Google Places API");
                    return Array.Empty<object>();
                }

                var placesResponse = JsonSerializer.Deserialize<GooglePlacesResponse>(responseContent, options);
                _logger.LogInformation($"Deserialized {placesResponse?.Places?.Count ?? 0} places");

                // Transform the response to match your ATM format
                if (placesResponse?.Places == null)
                {
                    return Array.Empty<object>();
                }

                return placesResponse.Places.Select(place => new
                {
                    Id = place.Id,
                    Name = place.DisplayName?.Text != null ? place.DisplayName.Text : "Unknown ATM",
                    Location = new { 
                        Lat = place.Location?.Latitude != null ? place.Location.Latitude : 0,
                        Lng = place.Location?.Longitude != null ? place.Location.Longitude : 0
                    },
                    Address = place.FormattedAddress != null ? place.FormattedAddress : "Address not available", 
                    IsOpen = true, // Google Places API doesn't provide real-time opening status
                    Distance = CalculateDistance(request.Latitude, request.Longitude,
                        place.Location?.Latitude != null ? place.Location.Latitude : 0,
                        place.Location?.Longitude != null ? place.Location.Longitude : 0),
                    BankName = ExtractBankName(place.DisplayName?.Text != null ? place.DisplayName.Text : "")
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching ATMs from Google Places API");
                throw;
            }
        }

        private double CalculateDistance(double lat1, double lon1, double lat2, double lon2)
        {
            const double R = 6371; // Earth's radius in kilometers
            var dLat = ToRad(lat2 - lat1);
            var dLon = ToRad(lon2 - lon1);
            var a = Math.Sin(dLat / 2) * Math.Sin(dLat / 2) +
                    Math.Cos(ToRad(lat1)) * Math.Cos(ToRad(lat2)) *
                    Math.Sin(dLon / 2) * Math.Sin(dLon / 2);
            var c = 2 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a));
            return R * c;
        }

        private double ToRad(double degrees)
        {
            return degrees * Math.PI / 180;
        }

        private string ExtractBankName(string displayName)
        {
            // Simple extraction - you might want to improve this based on your needs
            var parts = displayName.Split(' ');
            return parts.Length > 1 ? parts[0] : displayName;
        }
    }

    public class GooglePlacesResponse
    {
        public List<Place> Places { get; set; } = new();
    }

    public class Place
    {
        public string Id { get; set; } = "";
        public DisplayName DisplayName { get; set; } = new();
        public string FormattedAddress { get; set; } = "";
        public Location Location { get; set; } = new();
    }

    public class DisplayName
    {
        public string Text { get; set; } = "";
        public string LanguageCode { get; set; } = "";
    }

    public class Location
    {
        public double Latitude { get; set; }
        public double Longitude { get; set; }
    }
} 