namespace server_solution.Properties.Configuration
{
    public class SwaggerOptions
    {
        public string Title { get; set; } = "API";
        public string Version { get; set; } = "v1";
        public string Description { get; set; } = "";
        public string LaunchUrl { get; set; } = "/swagger/index.html";
        public bool LaunchBrowser { get; set; } = true;
    }
}
