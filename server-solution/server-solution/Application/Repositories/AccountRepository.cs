using Microsoft.EntityFrameworkCore;
using server_solution.Domain;
using server_solution.Infrastructure;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace server_solution.Application
{
    public class AccountRepository : IAccountRepository
    {
        private readonly AppDbContext _context;

        public AccountRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Account>> GetAccountsByUserId(Guid userId)
        {
            return (IEnumerable<Account>)await _context.Accounts.Where(a => a.UserId == userId).ToListAsync();
        }

        public async Task<Account> GetAccountById(Guid accountId) => await _context.Accounts.FirstOrDefaultAsync(a => a.AccountId == accountId);

        public async Task<Account> CreateAccount(Account account)
        {
            _context.Accounts.Add(account);
            await _context.SaveChangesAsync();
            return account;
        }

        public async Task<bool> DeleteAccount(Guid accountId)
        {
            var account = await _context.Accounts.FindAsync(accountId);
            if (account == null)
                return false;

            _context.Accounts.Remove(account);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
