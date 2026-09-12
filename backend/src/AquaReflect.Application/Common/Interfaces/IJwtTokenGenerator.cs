using AquaReflect.Domain.Entities;

namespace AquaReflect.Application.Common.Interfaces;

public interface IJwtTokenGenerator
{
    string GenerateAccessToken(User user);
    string GenerateRefreshToken();
}
