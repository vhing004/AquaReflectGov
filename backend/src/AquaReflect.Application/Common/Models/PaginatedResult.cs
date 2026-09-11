namespace AquaReflect.Application.Common.Models;

public class PaginatedResult<T>
{
    public IReadOnlyCollection<T> Items { get; }
    public int PageNumber { get; }
    public int PageSize { get; }
    public int TotalCount { get; }
    public int TotalPages { get; }
    public bool HasPreviousPage => PageNumber > 1;
    public bool HasNextPage => PageNumber < TotalPages;

    public PaginatedResult(IReadOnlyCollection<T> items, int count, int pageNumber, int pageSize)
    {
        PageNumber = pageNumber;
        PageSize = pageSize;
        TotalCount = count;
        TotalPages = (int)Math.Ceiling(count / (double)pageSize);
        Items = items;
    }

    public static PaginatedResult<T> Create(IReadOnlyCollection<T> items, int count, int pageNumber, int pageSize)
    {
        return new PaginatedResult<T>(items, count, pageNumber, pageSize);
    }
}
