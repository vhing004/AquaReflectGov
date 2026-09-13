using AquaReflect.Application.Common.Models;

namespace AquaReflect.Application.Common.Interfaces;

public interface IFileStorageService
{
    Task<FileUploadResult> SaveFileAsync(FileUploadModel file, string subFolder = "petitions", CancellationToken cancellationToken = default);
    Task<bool> DeleteFileAsync(string fileUrl, CancellationToken cancellationToken = default);
}
