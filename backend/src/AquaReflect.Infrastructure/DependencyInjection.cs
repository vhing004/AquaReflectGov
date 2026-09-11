using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace AquaReflect.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructureServices(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        // Sẽ đăng ký DbContext (PostgreSQL + PostGIS), Authentication, Repositories tại Task 1.2 và 1.4
        return services;
    }
}
