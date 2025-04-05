namespace server_solution.Infrastructure.DTOs
{
    public class UserRegisterDTO
    {
        public Guid? UserId { get; set; } // Nullable for new users
        public string Username { get; set; }
        public string Email { get; set; }

        // Government ID (optional)
        public string? GovernmentIdType { get; set; }
        public string? GovernmentIdNumber { get; set; }
        public string? GovernmentIdIssuingCountry { get; set; }
        public DateTime? GovernmentIdExpirationDate { get; set; }
    }
}
