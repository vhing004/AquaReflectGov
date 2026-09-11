namespace AquaReflect.Domain.Enums;

public enum PetitionCategoryType
{
    WaterPollution = 1,          // Ô nhiễm nguồn nước nuôi trồng / Xả thải công nghiệp
    AquaticDisease = 2,          // Dịch bệnh thủy hải sản (tôm, cá chết hàng loạt)
    IUUFishing = 3,              // Khai thác hải sản bất hợp pháp (IUU), vi phạm ngư trường, xung điện giã cào
    SeedAndFeedQuality = 4,      // Chất lượng con giống, thức ăn thủy sản, thuốc thú y thủy sản
    FisheryInfrastructure = 5,   // Hạ tầng cảng cá, âu neo đậu tránh trú bão, luồng hàng hải bị bồi lắng
    AdministrativeProcedure = 6, // Thủ tục hành chính (đăng kiểm, cấp giấy phép nuôi/khai thác)
    Other = 99                   // Khác
}
