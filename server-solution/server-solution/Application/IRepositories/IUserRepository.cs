using server_solution.Domain;
using server_solution.Infrastructure.DTOs;

namespace server_solution.Application
{
    public interface IUserRepository
    {
        Task<User> Register(UserRegisterDTO user, string password);
        Task<User> Login(string username, string password);
        Task<bool> UserExists(string username);
        Task<User> GetUserById(Guid id);
        Task<User> GetUserByUsername(string username);
        Task<User> UpdateUser(User user);
        string GetRefreshToken(string username);
        void SaveRefreshToken(string username, string refreshToken);
        void RemoveRefreshToken(string username, string refreshToken);
    }


}
