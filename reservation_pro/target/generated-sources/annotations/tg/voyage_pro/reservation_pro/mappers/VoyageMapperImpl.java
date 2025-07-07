package tg.voyage_pro.reservation_pro.mappers;

import java.util.ArrayList;
import java.util.List;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;
import tg.voyage_pro.reservation_pro.Model.VOYAGE;
import tg.voyage_pro.reservation_pro.dto.VoyageDTO;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2025-07-07T18:27:47+0000",
    comments = "version: 1.5.5.Final, compiler: javac, environment: Java 21.0.2 (Oracle Corporation)"
)
@Component
public class VoyageMapperImpl implements VoyageMapper {

    @Override
    public VOYAGE toEntity(VoyageDTO voyage) {
        if ( voyage == null ) {
            return null;
        }

        VOYAGE.VOYAGEBuilder vOYAGE = VOYAGE.builder();

        vOYAGE.heureDepart( voyage.getHeureDepart() );
        vOYAGE.heureArrivee( voyage.getHeureArrivee() );
        vOYAGE.prix( voyage.getPrix() );
        vOYAGE.idVoyage( voyage.getIdVoyage() );
        vOYAGE.departVoyage( voyage.getDepartVoyage() );
        vOYAGE.arriveVoyage( voyage.getArriveVoyage() );
        vOYAGE.dateVoyage( voyage.getDateVoyage() );

        return vOYAGE.build();
    }

    @Override
    public VoyageDTO toDto(VOYAGE voyage) {
        if ( voyage == null ) {
            return null;
        }

        VoyageDTO.VoyageDTOBuilder voyageDTO = VoyageDTO.builder();

        voyageDTO.heureDepart( voyage.getHeureDepart() );
        voyageDTO.heureArrivee( voyage.getHeureArrivee() );
        voyageDTO.prix( voyage.getPrix() );
        voyageDTO.idVoyage( voyage.getIdVoyage() );
        voyageDTO.departVoyage( voyage.getDepartVoyage() );
        voyageDTO.arriveVoyage( voyage.getArriveVoyage() );
        voyageDTO.dateVoyage( voyage.getDateVoyage() );

        return voyageDTO.build();
    }

    @Override
    public List<VoyageDTO> toDtos(List<VOYAGE> listeVoyage) {
        if ( listeVoyage == null ) {
            return null;
        }

        List<VoyageDTO> list = new ArrayList<VoyageDTO>( listeVoyage.size() );
        for ( VOYAGE vOYAGE : listeVoyage ) {
            list.add( toDto( vOYAGE ) );
        }

        return list;
    }
}
