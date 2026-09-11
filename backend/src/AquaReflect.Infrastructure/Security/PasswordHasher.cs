using System.Security.Cryptography;
using System.Text;
using AquaReflect.Application.Common.Interfaces;

namespace AquaReflect.Infrastructure.Security;

public class PasswordHasher : IPasswordHasher
{
    public (string Hash, string Salt) HashPassword(string password)
    {
        using var hmac = new HMACSHA512();
        var salt = Convert.ToBase64String(hmac.Key);
        var hash = Convert.ToBase64String(hmac.ComputeHash(Encoding.UTF8.GetBytes(password)));

        return (hash, salt);
    }

    public bool VerifyPassword(string password, string hash, string salt)
    {
        var key = Convert.FromBase64String(salt);
        using var hmac = new HMACSHA512(key);
        var computedHash = Convert.ToBase64String(hmac.ComputeHash(Encoding.UTF8.GetBytes(password)));

        return computedHash == hash;
    }
}
