package tg.voyage_pro.reservation_pro.mappers;

import java.util.List;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import tg.voyage_pro.reservation_pro.Model.VOYAGE;
import tg.voyage_pro.reservation_pro.dto.VoyageDTO;

@Mapper(componentModel = "spring")
public interface VoyageMapper {

    @Mapping(target = "heureDepart", source = "heureDepart")
    @Mapping(target = "heureArrivee", source = "heureArrivee")
    @Mapping(target = "prix", source = "prix")
    VOYAGE toEntity(VoyageDTO voyage);

    @Mapping(target = "heureDepart", source = "heureDepart")
    @Mapping(target = "heureArrivee", source = "heureArrivee")
    @Mapping(target = "prix", source = "prix")
    VoyageDTO toDto(VOYAGE voyage);

    List<VoyageDTO> toDtos(List<VOYAGE> listeVoyage);
}
