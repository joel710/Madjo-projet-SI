package tg.voyage_pro.reservation_pro.mappers;

 
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import tg.voyage_pro.reservation_pro.Model.PAIEMENT;
 
import tg.voyage_pro.reservation_pro.dto.PaiementDTO;

import java.util.List;

@Mapper(componentModel = "spring")
public interface PaiementMapper {
    @Mapping(target = "reservation", expression = "java(dto.getReservationId() != null ? new tg.voyage_pro.reservation_pro.Model.RESERVATION(dto.getReservationId()) : null)")
    @Mapping(target = "agent", expression = "java(dto.getAgentId() != null ? new tg.voyage_pro.reservation_pro.Model.AGENT(dto.getAgentId()) : null)")
    @Mapping(target = "montantPaiement", source = "montantPaiement")
    @Mapping(target = "status", source = "status")
    @Mapping(target = "method", source = "method")
    PAIEMENT toEntity( PaiementDTO  dto);

    @Mapping(target = "reservationId", expression = "java(entity.getReservation() != null ? entity.getReservation().getIdReservation() : null)")
    @Mapping(target = "agentId", expression = "java(entity.getAgent() != null ? entity.getAgent().getIdAgent() : null)")
    PaiementDTO toDto( PAIEMENT  entity);

    List<PaiementDTO> toListDto(List<PAIEMENT> list) ;
}
