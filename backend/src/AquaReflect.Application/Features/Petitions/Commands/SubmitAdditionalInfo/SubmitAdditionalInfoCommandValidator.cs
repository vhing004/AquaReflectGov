using AquaReflect.Application.Common.Models;
using FluentValidation;

namespace AquaReflect.Application.Features.Petitions.Commands.SubmitAdditionalInfo;

public class SubmitAdditionalInfoCommandValidator : AbstractValidator<SubmitAdditionalInfoCommand>
{
    private static readonly string[] AllowedExtensions = [".jpg", ".jpeg", ".png", ".webp", ".mp4", ".mov", ".pdf", ".docx"];
    private const long MaxFileSize = 15 * 1024 * 1024; // 15MB

    public SubmitAdditionalInfoCommandValidator()
    {
        RuleFor(x => x.TrackingCode)
            .NotEmpty().WithMessage("Mã hồ sơ tra cứu không được để trống.")
            .MaximumLength(50).WithMessage("Mã hồ sơ tra cứu không hợp lệ.");

        RuleFor(x => x.AdditionalContent)
            .NotEmpty().WithMessage("Vui lòng nhập nội dung thông tin bổ sung.")
            .MinimumLength(10).WithMessage("Nội dung thông tin bổ sung phải có ít nhất 10 ký tự.")
            .MaximumLength(3000).WithMessage("Nội dung thông tin bổ sung không được vượt quá 3,000 ký tự.");

        RuleFor(x => x.AccessPin)
            .MaximumLength(20).WithMessage("Mã PIN bảo mật không hợp lệ.");

        RuleFor(x => x.Files)
            .Must(files => files == null || files.Count <= 5)
            .WithMessage("Chỉ được đính kèm tối đa 5 tệp trong một lần bổ sung hồ sơ.")
            .Must(files =>
            {
                if (files == null || files.Count == 0) return true;
                return files.All(f => f.Length <= MaxFileSize);
            })
            .WithMessage("Mỗi tệp đính kèm không được vượt quá 15MB.")
            .Must(files =>
            {
                if (files == null || files.Count == 0) return true;
                return files.All(f =>
                {
                    var ext = Path.GetExtension(f.FileName).ToLowerInvariant();
                    return AllowedExtensions.Contains(ext);
                });
            })
            .WithMessage("Định dạng tệp không được hỗ trợ. Chỉ chấp nhận ảnh (JPG, PNG, WEBP), video (MP4, MOV) hoặc tài liệu (PDF, DOCX).");
    }
}
