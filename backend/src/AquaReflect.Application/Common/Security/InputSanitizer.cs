using System.Net;
using System.Text.RegularExpressions;
using Ganss.Xss;

namespace AquaReflect.Application.Common.Security;

/// <summary>
/// Tiện ích làm sạch và khử độc dữ liệu chống tấn công Cross-Site Scripting (XSS) và chèn mã HTML độc hại
/// </summary>
public static class InputSanitizer
{
    private static readonly Lazy<HtmlSanitizer> SanitizerInstance = new(() =>
    {
        var sanitizer = new HtmlSanitizer();

        // Chỉ cho phép các thẻ an toàn cho văn bản định dạng phong phú
        sanitizer.AllowedTags.Clear();
        sanitizer.AllowedTags.Add("b");
        sanitizer.AllowedTags.Add("i");
        sanitizer.AllowedTags.Add("u");
        sanitizer.AllowedTags.Add("strong");
        sanitizer.AllowedTags.Add("em");
        sanitizer.AllowedTags.Add("p");
        sanitizer.AllowedTags.Add("br");
        sanitizer.AllowedTags.Add("ul");
        sanitizer.AllowedTags.Add("ol");
        sanitizer.AllowedTags.Add("li");

        // Loại bỏ hoàn toàn các thuộc tính style và event handlers (onclick, onerror, onload...)
        sanitizer.AllowedAttributes.Clear();
        sanitizer.AllowedCssProperties.Clear();
        sanitizer.AllowedSchemes.Clear();

        return sanitizer;
    });

    private static readonly Regex HtmlTagRegex = new(@"<[^>]+>", RegexOptions.Compiled);
    private static readonly Regex MultipleSpacesRegex = new(@"[ ]{2,}", RegexOptions.Compiled);

    /// <summary>
    /// Làm sạch văn bản thuần (loại bỏ hoàn toàn tất cả thẻ HTML, script, iframe, thuộc tính độc hại)
    /// Dùng cho các trường như: Title, CitizenName, CitizenPhone, AddressText, TrackingCode...
    /// </summary>
    public static string SanitizePlainText(string? input)
    {
        if (string.IsNullOrWhiteSpace(input))
        {
            return string.Empty;
        }

        // 1. Dùng HtmlSanitizer để xử lý các mã script/style và các ký tự mã hóa lắt léo
        var sanitized = SanitizerInstance.Value.Sanitize(input);

        // 2. Tước bỏ triệt để mọi thẻ HTML còn lại
        sanitized = HtmlTagRegex.Replace(sanitized, string.Empty);

        // 3. Giải mã HTML entities an toàn (&amp; -> &, &lt; -> < nhưng đã không còn tag)
        sanitized = WebUtility.HtmlDecode(sanitized);

        // 4. Chuẩn hóa khoảng trắng
        sanitized = MultipleSpacesRegex.Replace(sanitized.Trim(), " ");

        return sanitized;
    }

    /// <summary>
    /// Làm sạch văn bản có định dạng (cho phép các thẻ cơ bản an toàn b, i, strong, em, br, p)
    /// Dùng cho các trường mô tả dài: Content, ResolutionSummary, Comments...
    /// </summary>
    public static string SanitizeRichText(string? input)
    {
        if (string.IsNullOrWhiteSpace(input))
        {
            return string.Empty;
        }

        var sanitized = SanitizerInstance.Value.Sanitize(input);
        return sanitized.Trim();
    }
}
