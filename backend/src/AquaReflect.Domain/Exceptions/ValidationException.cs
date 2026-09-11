namespace AquaReflect.Domain.Exceptions;

public class ValidationException : DomainException
{
    public IDictionary<string, string[]> Errors { get; }

    public ValidationException(string message = "Một hoặc nhiều lỗi xác thực đã xảy ra.")
        : base(message)
    {
        Errors = new Dictionary<string, string[]>();
    }

    public ValidationException(IDictionary<string, string[]> errors, string message = "Dữ liệu yêu cầu không hợp lệ.")
        : base(message)
    {
        Errors = errors;
    }
}
