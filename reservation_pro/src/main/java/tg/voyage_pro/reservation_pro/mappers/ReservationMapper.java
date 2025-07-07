package tg.voyage_pro.reservation_pro.mappers;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;
import tg.voyage_pro.reservation_pro.Model.RESERVATION;
import tg.voyage_pro.reservation_pro.Model.VOYAGE;
import tg.voyage_pro.reservation_pro.dto.ReservationDTO;
import tg.voyage_pro.reservation_pro.dto.ClientDTO;
import tg.voyage_pro.reservation_pro.dto.VoyageDTO;
import tg.voyage_pro.reservation_pro.dto.TypeBilletDTO;

import java.util.List;

@Mapper(componentModel = "spring", uses = {ClientMapper.class, VoyageMapper.class, TypeBilletMapper.class})
public interface ReservationMapper {

    @Mapping(source = "idReservation", target = "idReservation")
    @Mapping(source = "client", target = "client")
    @Mapping(source = "voyage", target = "voyage")
    @Mapping(source = "typeBillet", target = "typeBillet")
    @Mapping(source = "nombrePlacesReservees", target = "nombrePlacesReservees")
    @Mapping(source = "status", target = "status")
    @Mapping(source = "client.idClient", target = "idClient")
    @Mapping(source = "voyage.idVoyage", target = "idVoyage")
    @Mapping(source = "typeBillet.idTypeBillet", target = "idTypeBillet")
    ReservationDTO toDto(RESERVATION entity);

    List<ReservationDTO> toListDto(List<RESERVATION> entities);

    @Mapping(target = "client", ignore = true)
    @Mapping(target = "voyage", ignore = true)
    @Mapping(target = "typeBillet", ignore = true)
    @Mapping(source = "idReservation", target = "idReservation")
    @Mapping(source = "nombrePlacesReservees", target = "nombrePlacesReservees")
    @Mapping(source = "status", target = "status")
    @Mapping(source = "idClient", target = "client.idClient")
    @Mapping(source = "idVoyage", target = "voyage.idVoyage")
    @Mapping(source = "idTypeBillet", target = "typeBillet.idTypeBillet")
    RESERVATION toEntity(ReservationDTO dto);

    // Custom mapping for libelleVoyage
    @Named("mapVoyageToLibelle")
    default String mapVoyageToLibelle(VOYAGE voyage) {
        if (voyage == null) {
            return "N/A";
        }
        return voyage.getDepartVoyage() + " - " + voyage.getArriveVoyage();
    }
} 