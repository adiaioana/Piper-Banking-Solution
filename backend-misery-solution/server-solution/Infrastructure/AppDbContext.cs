using Microsoft.EntityFrameworkCore;
using server_solution.Domain;
using System.Collections.Generic;
using System.Reflection.Emit;

namespace server_solution.Infrastructure
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }
        public DbSet<User> Users { get; set; }
        public DbSet<Account> Accounts { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<User>()
                .ToTable("users")
                .HasKey(i => i.UserId);
            modelBuilder.Entity<User>()
               .Property(u => u.UserId)
               .HasColumnName("userid");

            modelBuilder.Entity<User>()
                .Property(u => u.Username)
                .HasColumnName("username");

            modelBuilder.Entity<User>()
                .Property(u => u.Email)
                .HasColumnName("email");

            modelBuilder.Entity<User>()
                .Property(u => u.Password)
                .HasColumnName("password");

            modelBuilder.Entity<User>()
                .Property(u => u.PasswordHash)
                .HasColumnName("passwordhash");

            modelBuilder.Entity<User>()
                .Property(u => u.PasswordSalt)
                .HasColumnName("passwordsalt");

            modelBuilder.Entity<User>()
                .Property(u => u.GovernmentIdType)
                .HasColumnName("governmentidtype");

            modelBuilder.Entity<User>()
                .Property(u => u.GovernmentIdNumber)
                .HasColumnName("governmentidnumber");

            modelBuilder.Entity<User>()
                .Property(u => u.GovernmentIdIssuingCountry)
                .HasColumnName("governmentidissuingcountry");

            modelBuilder.Entity<User>()
                .Property(u => u.GovernmentIdExpirationDate)
                .HasColumnName("governmentidexpirationdate");
            modelBuilder.Entity<User>()
                .Property(u => u.RefreshToken)
                .HasColumnName("refreshtoken");


            modelBuilder.Entity<Account>()
                .ToTable("accounts")
                .HasKey(i => i.AccountId);


            modelBuilder.Entity<Account>()
                .Property(a => a.AccountId)
                .HasColumnName("accountid");

            modelBuilder.Entity<Account>()
                .Property(a => a.UserId)
                .HasColumnName("userid");

            modelBuilder.Entity<Account>()
                .Property(a => a.AccountNumber)
                .HasColumnName("accountnumber");

            modelBuilder.Entity<Account>()
                .Property(a => a.Balance)
                .HasColumnName("balance");

            modelBuilder.Entity<Account>()
                .Property(a => a.AccountType)
                .HasColumnName("accounttype");



            modelBuilder.Entity<Account>()
               .HasOne<User>()                 // No navigation property in Account
               .WithMany()                    // No navigation property in User
               .HasForeignKey(a => a.UserId)  // Use UserId as FK
               .OnDelete(DeleteBehavior.Cascade); // Optional
        }
    }
}
