namespace AquaReflect.Domain.Exceptions;

public class ForbiddenException : DomainException
{
    public ForbiddenException(string message = "Bạn không có quyền thực hiện thao tác này.")
        : base(message)
    {
    }
}
