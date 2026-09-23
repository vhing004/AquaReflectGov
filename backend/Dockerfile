# ===== Build Stage =====
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

# Copy toàn bộ solution để restore packages (tận dụng Docker layer caching)
COPY ["backend/AquaReflect.sln", "./"]
COPY ["backend/src/AquaReflect.Api/AquaReflect.Api.csproj", "src/AquaReflect.Api/"]
COPY ["backend/src/AquaReflect.Application/AquaReflect.Application.csproj", "src/AquaReflect.Application/"]
COPY ["backend/src/AquaReflect.Domain/AquaReflect.Domain.csproj", "src/AquaReflect.Domain/"]
COPY ["backend/src/AquaReflect.Infrastructure/AquaReflect.Infrastructure.csproj", "src/AquaReflect.Infrastructure/"]

# Restore dependencies
RUN dotnet restore "src/AquaReflect.Api/AquaReflect.Api.csproj"

# Copy source code và build
COPY backend/src/ ./src/
RUN dotnet publish "src/AquaReflect.Api/AquaReflect.Api.csproj" \
    -c Release \
    -o /app/publish

# ===== Runtime Stage =====
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS runtime
WORKDIR /app

# Cài gói libicu cho hỗ trợ Unicode/Globalization
RUN apt-get update && apt-get install -y libicu-dev && rm -rf /var/lib/apt/lists/*

# Copy output publish
COPY --from=build /app/publish .

# Tạo thư mục uploads cho ảnh/video hiện trường (mount volume sau)
RUN mkdir -p wwwroot/uploads

# Expose port HTTP mặc định của ASP.NET Core
EXPOSE 8080

# Biến môi trường chuẩn ASP.NET Core
ENV ASPNETCORE_URLS=http://+:8080
ENV ASPNETCORE_ENVIRONMENT=Production

ENTRYPOINT ["dotnet", "AquaReflect.Api.dll"]
