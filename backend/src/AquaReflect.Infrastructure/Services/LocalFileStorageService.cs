using AquaReflect.Application.Common.Interfaces;
using AquaReflect.Application.Common.Models;
using AquaReflect.Domain.Enums;
using AquaReflect.Domain.Exceptions;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace AquaReflect.Infrastructure.Services;

public class LocalFileStorageService : IFileStorageService
{
    private readonly IConfiguration _configuration;
    private readonly ILogger<LocalFileStorageService> _logger;
    private readonly string _baseStoragePath;

    // Giới hạn dung lượng tối đa 25MB mỗi tệp
    private const long MaxFileSizeBytes = 25 * 1024 * 1024;

    private static readonly HashSet<string> AllowedExtensions = new(StringComparer.OrdinalIgnoreCase)
    {
        ".jpg", ".jpeg", ".png", ".webp", ".gif",
        ".mp4", ".mov", ".avi", ".mkv", ".webm",
        ".pdf", ".doc", ".docx", ".xls", ".xlsx", ".txt",
        ".mp3", ".wav", ".m4a"
    };

    public LocalFileStorageService(IConfiguration configuration, ILogger<LocalFileStorageService> logger)
    {
        _configuration = configuration;
        _logger = logger;

        // Ưu tiên đường dẫn cấu hình hoặc tự động dò tìm wwwroot của Api project
        var customPath = _configuration["FileStorage:BasePath"];
        if (!string.IsNullOrWhiteSpace(customPath))
        {
            _baseStoragePath = customPath;
        }
        else if (Directory.Exists(Path.Combine(Directory.GetCurrentDirectory(), "src", "AquaReflect.Api", "wwwroot")))
        {
            _baseStoragePath = Path.Combine(Directory.GetCurrentDirectory(), "src", "AquaReflect.Api", "wwwroot");
        }
        else if (Directory.Exists(Path.Combine(Directory.GetCurrentDirectory(), "wwwroot")))
        {
            _baseStoragePath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
        }
        else
        {
            _baseStoragePath = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "wwwroot");
        }

        if (!Directory.Exists(_baseStoragePath))
        {
            Directory.CreateDirectory(_baseStoragePath);
        }
    }

    public async Task<FileUploadResult> SaveFileAsync(
        FileUploadModel file, 
        string subFolder = "petitions", 
        CancellationToken cancellationToken = default)
    {
        if (file.ContentStream == null || file.Length == 0)
        {
            throw new ValidationException("Tệp tải lên rỗng hoặc không hợp lệ.");
        }

        if (file.Length > MaxFileSizeBytes)
        {
            throw new ValidationException($"Dung lượng tệp ({file.Length / (1024 * 1024)}MB) vượt quá giới hạn cho phép tối đa 25MB.");
        }

        var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
        if (string.IsNullOrWhiteSpace(extension) || !AllowedExtensions.Contains(extension))
        {
            throw new ValidationException($"Định dạng tệp '{extension}' không được hỗ trợ. Vui lòng tải lên ảnh (JPG, PNG, WEBP), video (MP4, MOV) hoặc tài liệu (PDF, DOCX).");
        }

        var fileType = DetermineAttachmentType(extension);
        var dateFolder = DateTime.UtcNow.ToString("yyyyMM");
        var targetDirectory = Path.Combine(_baseStoragePath, "uploads", subFolder, dateFolder);

        if (!Directory.Exists(targetDirectory))
        {
            Directory.CreateDirectory(targetDirectory);
        }

        var sanitizedOriginalName = SanitizeFileName(Path.GetFileNameWithoutExtension(file.FileName));
        var uniqueFileName = $"{Guid.NewGuid():N}_{sanitizedOriginalName}{extension}";
        var fullFilePath = Path.Combine(targetDirectory, uniqueFileName);

        using (var outputStream = new FileStream(fullFilePath, FileMode.Create, FileAccess.Write, FileShare.None))
        {
            if (file.ContentStream.CanSeek)
            {
                file.ContentStream.Position = 0;
            }
            await file.ContentStream.CopyToAsync(outputStream, cancellationToken);
        }

        var relativeUrl = $"/uploads/{subFolder}/{dateFolder}/{uniqueFileName}".Replace('\\', '/');
        _logger.LogInformation("Lưu tệp đính kèm thành công: {RelativeUrl} ({FileSize} bytes)", relativeUrl, file.Length);

        return new FileUploadResult
        {
            FileName = uniqueFileName,
            OriginalFileName = file.FileName,
            FileUrl = relativeUrl,
            MimeType = file.ContentType,
            FileSize = file.Length,
            FileType = fileType
        };
    }

    public Task<bool> DeleteFileAsync(string fileUrl, CancellationToken cancellationToken = default)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(fileUrl)) return Task.FromResult(false);

            var relativePath = fileUrl.TrimStart('/').Replace('/', Path.DirectorySeparatorChar);
            var fullPath = Path.Combine(_baseStoragePath, relativePath);

            if (File.Exists(fullPath))
            {
                File.Delete(fullPath);
                _logger.LogInformation("Đã xóa tệp: {FullPath}", fullPath);
                return Task.FromResult(true);
            }

            return Task.FromResult(false);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi khi xóa tệp: {FileUrl}", fileUrl);
            return Task.FromResult(false);
        }
    }

    private static AttachmentType DetermineAttachmentType(string extension)
    {
        return extension switch
        {
            ".jpg" or ".jpeg" or ".png" or ".webp" or ".gif" => AttachmentType.Image,
            ".mp4" or ".mov" or ".avi" or ".mkv" or ".webm" => AttachmentType.Video,
            ".mp3" or ".wav" or ".m4a" => AttachmentType.Audio,
            _ => AttachmentType.Document
        };
    }

    private static string SanitizeFileName(string fileName)
    {
        var invalids = Path.GetInvalidFileNameChars();
        var sanitized = string.Concat(fileName.Select(c => invalids.Contains(c) ? '_' : c));
        return sanitized.Length > 50 ? sanitized[..50] : sanitized;
    }
}
