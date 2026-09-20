using AquaReflect.Application.Features.Petitions.DTOs;
using MediatR;

namespace AquaReflect.Application.Features.Petitions.Queries.GetAdminPetitionDetail;

public record GetAdminPetitionDetailQuery(Guid Id) : IRequest<AdminPetitionDetailDto>;
