using Microsoft.EntityFrameworkCore;
using server_solution.Application;
using server_solution.Domain;
using server_solution.Infrastructure;
using server_solution.Infrastructure.DTOs;
using System;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;

    
namespace server_solution.Application
{
    public class UserRepository : IUserRepository
    {
        private readonly AppDbContext _context;

        public UserRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<User> Register(UserRegisterDTO almostUser, string password)
        {
            CreatePasswordHash(password, out byte[] passwordHash, out byte[] passwordSalt);
            var user = new User
            {
                UserId = new Guid(), 
                Username = almostUser.Username,
                Email = almostUser.Email,
                GovernmentIdType = almostUser.GovernmentIdType,
                GovernmentIdNumber = almostUser.GovernmentIdNumber,
                GovernmentIdIssuingCountry = almostUser.GovernmentIdIssuingCountry,
                GovernmentIdExpirationDate = almostUser.GovernmentIdExpirationDate,
                Password="",
                PasswordHash = Convert.ToBase64String(passwordHash),
                PasswordSalt = Convert.ToBase64String(passwordSalt)
            };
            Console.WriteLine(user.ToString);
            await _context.Users.AddAsync(user);
            await _context.SaveChangesAsync();

            return user;
        }
        public async Task<User> UpdateUser(User user)
        {
            _context.Users.Update(user);
            await _context.SaveChangesAsync();

            return user;
        }



        public async Task<User> Login(string username, string password)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Username == username);

            if (user == null || !VerifyPasswordHash(password, Convert.FromBase64String(user.PasswordHash), Convert.FromBase64String(user.PasswordSalt)))
                return null;

            return user;
        }

        public async Task<bool> UserExists(string username)
        {
            return await _context.Users.AnyAsync(u => u.Username == username);
        }

        public async Task<User> GetUserById(Guid id)
        {
            return await _context.Users.FindAsync(id);
        }

        public async Task<User> GetUserByUsername(string username)
        {
            return await _context.Users.FirstOrDefaultAsync(u => u.Username == username);
        }

        // Helper methods

        private void CreatePasswordHash(string password, out byte[] passwordHash, out byte[] passwordSalt)
        {
            using (var hmac = new HMACSHA512())
            {
                passwordSalt = hmac.Key;
                passwordHash = hmac.ComputeHash(Encoding.UTF8.GetBytes(password));
            }
        }

        private bool VerifyPasswordHash(string password, byte[] storedHash, byte[] storedSalt)
        {
            using (var hmac = new HMACSHA512(storedSalt))
            {
                var computedHash = hmac.ComputeHash(Encoding.UTF8.GetBytes(password));
                return computedHash.SequenceEqual(storedHash);
            }
        }

        public string GetRefreshToken(string username)
        {
            var user = _context.Users.SingleOrDefault(u => u.Username == username);
            return user?.RefreshToken;
        }

        public void SaveRefreshToken(string username, string refreshToken)
        {
            var user = _context.Users.SingleOrDefault(u => u.Username == username);
            if (user != null)
            {
                user.RefreshToken = refreshToken;
                _context.SaveChanges();
            }
        }

        public void RemoveRefreshToken(string username, string refreshToken)
        {
            var user = _context.Users.SingleOrDefault(u => u.Username == username);
            if (user != null && user.RefreshToken == refreshToken)
            {
                user.RefreshToken = null;
                _context.SaveChanges();
            }
        }
    }
}
