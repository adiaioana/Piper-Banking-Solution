using Microsoft.AspNetCore.Mvc;
using server_solution.Application;
using server_solution.Domain;
using server_solution.Infrastructure.DTOs;
using System;
using System.Security.Claims;
using System.Threading.Tasks;

namespace server_solution.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AccountsController : ControllerBase
    {
        private readonly IAccountRepository _accountRepository;
        private readonly IUserRepository _userRepository;

        public AccountsController(IAccountRepository accountRepository, IUserRepository userRepository)
        {
            _accountRepository = accountRepository;
            _userRepository = userRepository;
        }

        [HttpGet("users/{userId}")]
        public async Task<IActionResult> GetUser(Guid userId)
        {
            var userIdFromToken = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userIdFromToken == null || userId != Guid.Parse(userIdFromToken))
            {
                return Unauthorized();
            }

            var user = await _userRepository.GetUserById(userId);
            if (user == null)
                return NotFound();

            return Ok(user);
        }

        [HttpPut("users/{userId}")]
        public async Task<IActionResult> UpdateUser(Guid userId, UserUpdateDto userUpdateDto)
        {
            var userIdFromToken = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userIdFromToken == null || userId != Guid.Parse(userIdFromToken))
            {
                return Unauthorized();
            }

            var user = await _userRepository.GetUserById(userId);
            if (user == null)
            {
                return NotFound();
            }

            // Update user properties
            user.Email = userUpdateDto.Email ?? user.Email;
            user.GovernmentIdType = userUpdateDto.GovernmentIdType ?? user.GovernmentIdType;
            user.GovernmentIdNumber = userUpdateDto.GovernmentIdNumber ?? user.GovernmentIdNumber;
            user.GovernmentIdIssuingCountry = userUpdateDto.GovernmentIdIssuingCountry ?? user.GovernmentIdIssuingCountry;
            user.GovernmentIdExpirationDate = userUpdateDto.GovernmentIdExpirationDate ?? user.GovernmentIdExpirationDate;

            var updatedUser = await _userRepository.UpdateUser(user);
            if (updatedUser == null)
            {
                return NotFound();
            }

            return Ok(updatedUser);
        }

        [HttpGet("users/{userId}/accounts")]
        public async Task<IActionResult> GetUserAccounts(Guid userId)
        {
            var userIdFromToken = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userIdFromToken == null || userId != Guid.Parse(userIdFromToken))
            {
                return Unauthorized();
            }

            var accounts = await _accountRepository.GetAccountsByUserId(userId);
            return Ok(accounts);
        }

        [HttpPost("users/{userId}/accounts")]
        public async Task<IActionResult> CreateAccount(Guid userId, Account account)
        {
            var userIdFromToken = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userIdFromToken == null || userId != Guid.Parse(userIdFromToken))
            {
                return Unauthorized();
            }

            account.UserId = userId;
            var createdAccount = await _accountRepository.CreateAccount(account);
            return Ok(createdAccount);
        }

        [HttpGet("accounts/{accountId}")]
        public async Task<IActionResult> GetAccount(Guid accountId)
        {
            var account = await _accountRepository.GetAccountById(accountId);
            if (account == null)
                return NotFound();

            return Ok(account);
        }

        [HttpDelete("accounts/{accountId}")]
        public async Task<IActionResult> DeleteAccount(Guid accountId)
        {
            var result = await _accountRepository.DeleteAccount(accountId);
            if (!result)
                return NotFound();

            return Ok();
        }
    }
}
