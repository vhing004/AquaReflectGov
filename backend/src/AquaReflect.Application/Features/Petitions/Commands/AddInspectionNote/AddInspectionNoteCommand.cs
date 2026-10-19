using AquaReflect.Application.Common.Models;
using AquaReflect.Application.Features.Petitions.DTOs;
using MediatR;

namespace AquaReflect.Application.Features.Petitions.Commands.AddInspectionNote;

/// <summary>
/// Command ghi chú nghiệp vụ hiện trường kèm ảnh biên bản (Task 4.1)
/// Dành cho Chuyên viên đang thực địa khảo sát trong trạng thái Investigating.
/// Cho phép đính kèm ảnh/video hiện trường, văn bản biên bản.
/// </summary>
public class AddInspectionNoteCommand : IRequest<InspectionNoteResultDto>
{
    /// <summary>ID hồ sơ phản ánh đang thẩm tra</summary>
    public Guid PetitionId { get; set; }

    /// <summary>Nội dung ghi chú hiện trường (quan sát, biên bản tóm tắt)</summary>
    public string NoteContent { get; set; } = string.Empty;

    /// <summary>Loại ghi chú: FieldObservation (Quan sát), SiteVisitReport (Biên bản), EvidenceCollection (Thu thập chứng cứ)</summary>
    public InspectionNoteType NoteType { get; set; } = InspectionNoteType.FieldObservation;

    /// <summary>Tọa độ GPS vị trí chụp ảnh/ghi chú từ hiện trường (WGS84)</summary>
    public double? FieldLatitude { get; set; }

    /// <summary>Tọa độ GPS vị trí chụp ảnh/ghi chú từ hiện trường (WGS84)</summary>
    public double? FieldLongitude { get; set; }

    /// <summary>Tệp ảnh/video/biên bản đính kèm từ thực địa (tối đa 5 tệp)</summary>
    public List<FileUploadModel> Files { get; set; } = new();
}

/// <summary>Phân loại ghi chú hiện trường</summary>
public enum InspectionNoteType
{
    /// <summary>Quan sát thực địa (ghi nhận hiện trạng)</summary>
    FieldObservation = 1,
    /// <summary>Biên bản kiểm tra hiện trường chính thức</summary>
    SiteVisitReport = 2,
    /// <summary>Thu thập mẫu/chứng cứ hiện trường</summary>
    EvidenceCollection = 3,
    /// <summary>Ghi chú nội bộ khác</summary>
    InternalNote = 4
}
