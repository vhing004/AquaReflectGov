using System.Net;
using System.Text.Json;
using AquaReflect.Application.Common.Models;
using AquaReflect.Domain.Exceptions;

namespace AquaReflect.Api.Middlewares;

public class ExceptionHandlingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionHandlingMiddleware> _logger;

    public ExceptionHandlingMiddleware(RequestDelegate next, ILogger<ExceptionHandlingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi không được xử lý xảy ra trong quá trình xử lý request: {Path}", context.Request.Path);
            await HandleExceptionAsync(context, ex);
        }
    }

    private static async Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        var response = context.Response;
        response.ContentType = "application/json";

        ApiResponse apiResponse;

        switch (exception)
        {
            case ValidationException valEx:
                response.StatusCode = (int)HttpStatusCode.BadRequest;
                apiResponse = ApiResponse.Fail(valEx.Message, response.StatusCode, valEx.Errors);
                break;

            case NotFoundException notFoundEx:
                response.StatusCode = (int)HttpStatusCode.NotFound;
                apiResponse = ApiResponse.Fail(notFoundEx.Message, response.StatusCode);
                break;

            case BadRequestException badReqEx:
                response.StatusCode = (int)HttpStatusCode.BadRequest;
                apiResponse = ApiResponse.Fail(badReqEx.Message, response.StatusCode);
                break;

            case ForbiddenException forbiddenEx:
                response.StatusCode = (int)HttpStatusCode.Forbidden;
                apiResponse = ApiResponse.Fail(forbiddenEx.Message, response.StatusCode);
                break;

            case DomainException domainEx:
                response.StatusCode = (int)HttpStatusCode.BadRequest;
                apiResponse = ApiResponse.Fail(domainEx.Message, response.StatusCode);
                break;

            case UnauthorizedAccessException:
                response.StatusCode = (int)HttpStatusCode.Unauthorized;
                apiResponse = ApiResponse.Fail("Bạn cần đăng nhập để thực hiện thao tác này.", response.StatusCode);
                break;

            default:
                response.StatusCode = (int)HttpStatusCode.InternalServerError;
                apiResponse = ApiResponse.Fail("Đã xảy ra lỗi hệ thống. Vui lòng thử lại sau.", response.StatusCode);
                break;
        }

        var jsonOptions = new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        };

        await response.WriteAsync(JsonSerializer.Serialize(apiResponse, jsonOptions));
    }
}
