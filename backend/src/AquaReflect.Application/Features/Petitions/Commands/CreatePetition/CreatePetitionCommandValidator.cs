using FluentValidation;

namespace AquaReflect.Application.Features.Petitions.Commands.CreatePetition;

public class CreatePetitionCommandValidator : AbstractValidator<CreatePetitionCommand>
{
    public CreatePetitionCommandValidator()
    {
        RuleFor(x => x.Title)
            .NotEmpty().WithMessage("Tiêu đề phản ánh không được để trống.")
            .MinimumLength(5).WithMessage("Tiêu đề phản ánh phải có ít nhất 5 ký tự.")
            .MaximumLength(300).WithMessage("Tiêu đề phản ánh không được vượt quá 300 ký tự.");

        RuleFor(x => x.Content)
            .NotEmpty().WithMessage("Nội dung chi tiết phản ánh không được để trống.")
            .MinimumLength(10).WithMessage("Nội dung phản ánh phải có ít nhất 10 ký tự.")
            .MaximumLength(3000).WithMessage("Nội dung phản ánh không được vượt quá 3000 ký tự.");

        RuleFor(x => x.CategoryId)
            .NotEmpty().WithMessage("Vui lòng chọn danh mục phản ánh.");

        When(x => !x.IsAnonymous, () =>
        {
            RuleFor(x => x.CitizenName)
                .NotEmpty().WithMessage("Vui lòng nhập họ và tên người phản ánh khi không chọn chế độ ẩn danh.")
                .MaximumLength(150).WithMessage("Họ và tên không được vượt quá 150 ký tự.");

            When(x => !string.IsNullOrWhiteSpace(x.CitizenPhone), () =>
            {
                RuleFor(x => x.CitizenPhone)
                    .Matches(@"^(0|\+84)[3|5|7|8|9][0-9]{8}$")
                    .WithMessage("Số điện thoại không đúng định dạng số di động Việt Nam.");
            });

            When(x => !string.IsNullOrWhiteSpace(x.CitizenEmail), () =>
            {
                RuleFor(x => x.CitizenEmail)
                    .EmailAddress().WithMessage("Địa chỉ email không đúng định dạng.")
                    .MaximumLength(100).WithMessage("Email không được vượt quá 100 ký tự.");
            });
        });

        When(x => x.Latitude.HasValue, () =>
        {
            RuleFor(x => x.Latitude!.Value)
                .InclusiveBetween(-90, 90).WithMessage("Vĩ độ (Latitude) phải nằm trong khoảng từ -90 đến 90 độ.");
        });

        When(x => x.Longitude.HasValue, () =>
        {
            RuleFor(x => x.Longitude!.Value)
                .InclusiveBetween(-180, 180).WithMessage("Kinh độ (Longitude) phải nằm trong khoảng từ -180 đến 180 độ.");
        });

        RuleFor(x => x.Files)
            .Must(files => files == null || files.Count <= 5)
            .WithMessage("Chỉ được đính kèm tối đa 5 tệp minh chứng hiện trường.");
    }
}
