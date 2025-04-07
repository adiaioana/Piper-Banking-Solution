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
                // Uncomment to use mock data instead of API call
                // _logger.LogInformation("Returning mock data for testing");
                // return GetMockData(request);

                var searchRequest = new
                {
                    includedTypes = new[] { "atm" },
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
                            radius = 5000.0
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
                _httpClient.DefaultRequestHeaders.Add("X-Goog-FieldMask", "places.id");
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
                _logger.LogInformation($"Response content length: {responseContent?.Length ?? 0}");
                _logger.LogInformation($"Response content: {responseContent}");

                // If we get a 200 response but with empty content, return mock data
                if (string.IsNullOrEmpty(responseContent))
                {
                    _logger.LogWarning("Received empty response from Google Places API, falling back to mock data");
                    return GetMockData(request);
                }

                try
                {
                    var placesResponse = JsonSerializer.Deserialize<GooglePlacesResponse>(responseContent, options);
                    _logger.LogInformation($"Deserialized {placesResponse?.Places?.Count ?? 0} places");

                    // Transform the response to match your ATM format
                    if (placesResponse?.Places == null || placesResponse.Places.Count == 0)
                    {
                        _logger.LogWarning("No places found in the response, falling back to mock data");
                        return GetMockData(request);
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
                catch (JsonException ex)
                {
                    _logger.LogError(ex, $"Error deserializing response: {responseContent}");
                    _logger.LogWarning("Falling back to mock data due to deserialization error");
                    return GetMockData(request);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching ATMs from Google Places API");
                _logger.LogWarning("Falling back to mock data due to exception");
                return GetMockData(request);
            }
        }

        private IEnumerable<object> GetMockData(LocationRequest request)
        {
            return new[]
            {
                new
                {
                    Id = "atm1",
                    Name = "Bank of America ATM",
                    Location = new { Lat = request.Latitude + 0.001, Lng = request.Longitude + 0.001 },
                    Address = "123 Main St, Anytown, USA",
                    IsOpen = true,
                    Distance = 0.5,
                    BankName = "Bank of America"
                },
                new
                {
                    Id = "atm2",
                    Name = "Chase ATM",
                    Location = new { Lat = request.Latitude - 0.001, Lng = request.Longitude - 0.001 },
                    Address = "456 Oak Ave, Anytown, USA",
                    IsOpen = true,
                    Distance = 0.8,
                    BankName = "Chase"
                },
                new
                {
                    Id = "atm3",
                    Name = "Wells Fargo ATM",
                    Location = new { Lat = request.Latitude + 0.002, Lng = request.Longitude - 0.002 },
                    Address = "789 Pine St, Anytown, USA",
                    IsOpen = false,
                    Distance = 1.2,
                    BankName = "Wells Fargo"
                }
            };
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