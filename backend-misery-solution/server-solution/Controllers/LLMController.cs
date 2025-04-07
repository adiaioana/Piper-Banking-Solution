using Microsoft.AspNetCore.Mvc;
using System.Text;
using System.Text.Json;
using server_solution.Domain;
using server_solution.Services;

namespace server_solution.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class LLMController : ControllerBase
    {
        private readonly ILogger<LLMController> _logger;
        private readonly IConfiguration _configuration;
        private readonly HttpClient _httpClient;

        public LLMController(ILogger<LLMController> logger, IConfiguration configuration)
        {
            _logger = logger;
            _configuration = configuration;
            _httpClient = new HttpClient();
        }

        [HttpPost("analyze")]
        public async Task<IActionResult> AnalyzeText([FromBody] TextAnalysisRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                _logger.LogInformation($"Received text analysis request for text: {request.Text?.Substring(0, Math.Min(50, request.Text?.Length ?? 0))}...");

                var apiKey = _configuration["GoogleLLM:ApiKey"];
                if (string.IsNullOrEmpty(apiKey))
                {
                    _logger.LogError("Google LLM API key is missing in configuration");
                    return StatusCode(500, "API configuration error");
                }

                // Prepare the request to Google's Gemini API
                var geminiRequest = new
                {
                    contents = new[]
                    {
                        new
                        {
                            parts = new[]
                            {
                                new
                                {
                                    text = request.Text
                                }
                            }
                        }
                    },
                    generationConfig = new
                    {
                        temperature = 0.2,
                        topK = 40,
                        topP = 0.95,
                        maxOutputTokens = 1024
                    }
                };

                var options = new JsonSerializerOptions
                {
                    PropertyNamingPolicy = JsonNamingPolicy.CamelCase
                };

                var jsonRequest = JsonSerializer.Serialize(geminiRequest, options);
                _logger.LogInformation($"Request payload: {jsonRequest}");

                var content = new StringContent(jsonRequest, Encoding.UTF8, "application/json");

                _httpClient.DefaultRequestHeaders.Clear();
                _httpClient.DefaultRequestHeaders.Add("x-goog-api-key", apiKey);

                var response = await _httpClient.PostAsync(
                    $"https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key={apiKey}",
                    content
                );

                _logger.LogInformation($"Response status code: {response.StatusCode}");

                if (!response.IsSuccessStatusCode)
                {
                    var errorContent = await response.Content.ReadAsStringAsync();
                    _logger.LogError($"API Error: {errorContent}");
                    return StatusCode((int)response.StatusCode, $"API Error: {errorContent}");
                }

                var responseContent = await response.Content.ReadAsStringAsync();
                _logger.LogInformation($"Response content: {responseContent}");

                // Parse the response
                var geminiResponse = JsonSerializer.Deserialize<GeminiResponse>(responseContent, options);

                if (geminiResponse?.Candidates == null || geminiResponse.Candidates.Length == 0)
                {
                    return Ok(new { message = "No response generated", rawResponse = geminiResponse });
                }

                // Extract the generated text
                var generatedText = geminiResponse.Candidates[0].Content.Parts[0].Text;

                return Ok(new
                {
                    generatedText,
                    rawResponse = geminiResponse
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing text analysis request");
                return StatusCode(500, "An error occurred while processing your request");
            }
        }

        [HttpPost("analyze-receipt")]
        public async Task<IActionResult> AnalyzeReceipt([FromBody] ReceiptAnalysisRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                _logger.LogInformation("Received receipt analysis request");

                var apiKey = _configuration["GoogleLLM:ApiKey"];
                if (string.IsNullOrEmpty(apiKey))
                {
                    _logger.LogError("Google LLM API key is missing in configuration");
                    return StatusCode(500, "API configuration error");
                }

                // Prepare the prompt for receipt analysis
                var prompt = $@"
                Analyze this receipt text and extract the following information in JSON format:
                - merchant name
                - date
                - total amount
                - list of items with description, quantity, and price

                Receipt text:
                {request.ReceiptText}

                Return ONLY valid JSON with no additional text.
                ";

                // Prepare the request to Google's Gemini API
                var geminiRequest = new
                {
                    contents = new[]
                    {
                        new
                        {
                            parts = new[]
                            {
                                new
                                {
                                    text = prompt
                                }
                            }
                        }
                    },
                    generationConfig = new
                    {
                        temperature = 0.1,
                        topK = 40,
                        topP = 0.95,
                        maxOutputTokens = 1024
                    }
                };

                var options = new JsonSerializerOptions
                {
                    PropertyNamingPolicy = JsonNamingPolicy.CamelCase
                };

                var jsonRequest = JsonSerializer.Serialize(geminiRequest, options);
                _logger.LogInformation($"Request payload: {jsonRequest}");

                var content = new StringContent(jsonRequest, Encoding.UTF8, "application/json");

                _httpClient.DefaultRequestHeaders.Clear();
                _httpClient.DefaultRequestHeaders.Add("x-goog-api-key", apiKey);

                var response = await _httpClient.PostAsync(
                    $"https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key={apiKey}",
                    content
                );

                _logger.LogInformation($"Response status code: {response.StatusCode}");

                if (!response.IsSuccessStatusCode)
                {
                    var errorContent = await response.Content.ReadAsStringAsync();
                    _logger.LogError($"API Error: {errorContent}");
                    return StatusCode((int)response.StatusCode, $"API Error: {errorContent}");
                }

                var responseContent = await response.Content.ReadAsStringAsync();
                _logger.LogInformation($"Response content: {responseContent}");

                // Parse the response
                var geminiResponse = JsonSerializer.Deserialize<GeminiResponse>(responseContent, options);

                if (geminiResponse?.Candidates == null || geminiResponse.Candidates.Length == 0)
                {
                    return Ok(new { message = "No response generated", rawResponse = geminiResponse });
                }

                // Extract the generated text
                var generatedText = geminiResponse.Candidates[0].Content.Parts[0].Text;

                // Try to parse the JSON response
                try
                {
                    var receiptData = JsonSerializer.Deserialize<ReceiptAnalysisResult>(generatedText, options);
                    return Ok(receiptData);
                }
                catch (JsonException ex)
                {
                    _logger.LogError(ex, "Error parsing receipt analysis result");
                    return Ok(new { 
                        message = "Could not parse receipt data as JSON", 
                        rawText = generatedText 
                    });
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing receipt analysis request");
                return StatusCode(500, "An error occurred while processing your request");
            }
        }

        [HttpPost("analyze-image")]
        public async Task<IActionResult> AnalyzeImage([FromBody] ImageAnalysisRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                _logger.LogInformation("Received image analysis request");

                var apiKey = _configuration["GoogleLLM:ApiKey"];
                if (string.IsNullOrEmpty(apiKey))
                {
                    _logger.LogError("Google LLM API key is missing in configuration");
                    return StatusCode(500, "API configuration error");
                }

                // Prepare the request to Google's Gemini Pro Vision API
                var geminiRequest = new
                {
                    contents = new[]
                    {
                        new
                        {
                            parts = new[]
                            {
                                new
                                {
                                    text = request.Prompt ?? "Describe what you see in this image in detail."
                                },
                                new
                                {
                                    inlineData = new
                                    {
                                        mimeType = request.MimeType ?? "image/jpeg",
                                        data = request.ImageBase64
                                    }
                                }
                            }
                        }
                    },
                    generationConfig = new
                    {
                        temperature = 0.2,
                        topK = 40,
                        topP = 0.95,
                        maxOutputTokens = 1024
                    }
                };

                var options = new JsonSerializerOptions
                {
                    PropertyNamingPolicy = JsonNamingPolicy.CamelCase
                };

                var jsonRequest = JsonSerializer.Serialize(geminiRequest, options);
                _logger.LogInformation("Request payload sent to Gemini Pro Vision API");

                var content = new StringContent(jsonRequest, Encoding.UTF8, "application/json");

                _httpClient.DefaultRequestHeaders.Clear();
                _httpClient.DefaultRequestHeaders.Add("x-goog-api-key", apiKey);

                var response = await _httpClient.PostAsync(
                    $"https://generativelanguage.googleapis.com/v1beta/models/gemini-pro-vision:generateContent?key={apiKey}",
                    content
                );

                _logger.LogInformation($"Response status code: {response.StatusCode}");

                if (!response.IsSuccessStatusCode)
                {
                    var errorContent = await response.Content.ReadAsStringAsync();
                    _logger.LogError($"API Error: {errorContent}");
                    return StatusCode((int)response.StatusCode, $"API Error: {errorContent}");
                }

                var responseContent = await response.Content.ReadAsStringAsync();
                _logger.LogInformation($"Response content: {responseContent}");

                // Parse the response
                var geminiResponse = JsonSerializer.Deserialize<GeminiResponse>(responseContent, options);

                if (geminiResponse?.Candidates == null || geminiResponse.Candidates.Length == 0)
                {
                    return Ok(new { message = "No response generated", rawResponse = geminiResponse });
                }

                // Extract the generated text
                var generatedText = geminiResponse.Candidates[0].Content.Parts[0].Text;

                return Ok(new
                {
                    generatedText,
                    rawResponse = geminiResponse
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing image analysis request");
                return StatusCode(500, "An error occurred while processing your request");
            }
        }

        [HttpPost("analyze-receipt-image")]
        public async Task<IActionResult> AnalyzeReceiptImage([FromBody] ImageAnalysisRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                _logger.LogInformation("Received receipt image analysis request");

                var apiKey = _configuration["GoogleLLM:ApiKey"];
                if (string.IsNullOrEmpty(apiKey))
                {
                    _logger.LogError("Google LLM API key is missing in configuration");
                    return StatusCode(500, "API configuration error");
                }

                // Prepare the prompt for receipt image analysis
                var prompt = @"
                Analyze this receipt image and extract the following information in JSON format:
                - merchant name
                - date
                - total amount
                - list of items with description, quantity, and price

                Return ONLY valid JSON with no additional text.
                ";

                // Prepare the request to Google's Gemini Pro Vision API
                var geminiRequest = new
                {
                    contents = new[]
                    {
                        new
                        {
                            parts = new[]
                            {
                                new
                                {
                                    text = prompt
                                },
                                new
                                {
                                    inlineData = new
                                    {
                                        mimeType = request.MimeType ?? "image/jpeg",
                                        data = request.ImageBase64
                                    }
                                }
                            }
                        }
                    },
                    generationConfig = new
                    {
                        temperature = 0.1,
                        topK = 40,
                        topP = 0.95,
                        maxOutputTokens = 1024
                    }
                };

                var options = new JsonSerializerOptions
                {
                    PropertyNamingPolicy = JsonNamingPolicy.CamelCase
                };

                var jsonRequest = JsonSerializer.Serialize(geminiRequest, options);
                _logger.LogInformation("Request payload sent to Gemini Pro Vision API");

                var content = new StringContent(jsonRequest, Encoding.UTF8, "application/json");

                _httpClient.DefaultRequestHeaders.Clear();
                _httpClient.DefaultRequestHeaders.Add("x-goog-api-key", apiKey);

                var response = await _httpClient.PostAsync(
                    $"https://generativelanguage.googleapis.com/v1beta/models/gemini-pro-vision:generateContent?key={apiKey}",
                    content
                );

                _logger.LogInformation($"Response status code: {response.StatusCode}");

                if (!response.IsSuccessStatusCode)
                {
                    var errorContent = await response.Content.ReadAsStringAsync();
                    _logger.LogError($"API Error: {errorContent}");
                    return StatusCode((int)response.StatusCode, $"API Error: {errorContent}");
                }

                var responseContent = await response.Content.ReadAsStringAsync();
                _logger.LogInformation($"Response content: {responseContent}");

                // Parse the response
                var geminiResponse = JsonSerializer.Deserialize<GeminiResponse>(responseContent, options);

                if (geminiResponse?.Candidates == null || geminiResponse.Candidates.Length == 0)
                {
                    return Ok(new { message = "No response generated", rawResponse = geminiResponse });
                }

                // Extract the generated text
                var generatedText = geminiResponse.Candidates[0].Content.Parts[0].Text;

                // Try to parse the JSON response
                try
                {
                    var receiptData = JsonSerializer.Deserialize<ReceiptAnalysisResult>(generatedText, options);
                    return Ok(receiptData);
                }
                catch (JsonException ex)
                {
                    _logger.LogError(ex, "Error parsing receipt image analysis result");
                    return Ok(new { 
                        message = "Could not parse receipt data as JSON", 
                        rawText = generatedText 
                    });
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing receipt image analysis request");
                return StatusCode(500, "An error occurred while processing your request");
            }
        }
    }

    public class TextAnalysisRequest
    {
        public string Text { get; set; } = string.Empty;
    }

    public class ReceiptAnalysisRequest
    {
        public string ReceiptText { get; set; } = string.Empty;
    }

    public class ImageAnalysisRequest
    {
        public string ImageBase64 { get; set; } = string.Empty;
        public string? MimeType { get; set; }
        public string? Prompt { get; set; }
    }

    public class ReceiptAnalysisResult
    {
        public string Merchant { get; set; } = string.Empty;
        public string Date { get; set; } = string.Empty;
        public decimal Total { get; set; }
        public List<ReceiptItem> Items { get; set; } = new List<ReceiptItem>();
    }

    public class ReceiptItem
    {
        public string Description { get; set; } = string.Empty;
        public int Quantity { get; set; }
        public decimal Price { get; set; }
    }

    public class GeminiResponse
    {
        public Candidate[] Candidates { get; set; } = Array.Empty<Candidate>();
    }

    public class Candidate
    {
        public Content Content { get; set; } = new Content();
    }

    public class Content
    {
        public Part[] Parts { get; set; } = Array.Empty<Part>();
    }

    public class Part
    {
        public string Text { get; set; } = string.Empty;
    }
} 