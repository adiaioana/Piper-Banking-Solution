using server_solution.Domain;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace server_solution.Application
{
    public interface IAccountRepository
    {
        Task<IEnumerable<Account>> GetAccountsByUserId(Guid userId);
        Task<Account> GetAccountById(Guid accountId);
        Task<Account> CreateAccount(Account account);
        Task<bool> DeleteAccount(Guid accountId);
    }
}
