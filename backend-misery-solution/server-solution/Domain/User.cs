namespace server_solution.Domain
{
    public class User
    {
        public Guid UserId { get; set; }

        // Auth info
        public string Username { get; set; }
        public string Email { get; set; }
        public string? Password { get; set; } // Nullable for security reasons
        public string? PasswordHash { get; set; }
        public string? PasswordSalt { get; set; }

        // Government ID info
        public string GovernmentIdType { get; set; }        // e.g., Passport, National ID, Driver’s License
        public string GovernmentIdNumber { get; set; }      // Store securely or partially masked
        public string GovernmentIdIssuingCountry { get; set; }
        public DateTime? GovernmentIdExpirationDate { get; set; } // Nullable in case of non-expiring IDs

        public string? RefreshToken { get; set; } // For JWT refresh token
    }
}
