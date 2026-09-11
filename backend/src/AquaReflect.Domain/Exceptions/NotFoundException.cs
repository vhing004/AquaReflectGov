namespace AquaReflect.Domain.Exceptions;

public class NotFoundException : DomainException
{
    public NotFoundException(string message) : base(message)
    {
    }

    public NotFoundException(string name, object key)
        : base($"Không tìm thấy thực thể '{name}' với khóa '{key}'.")
    {
    }
}
