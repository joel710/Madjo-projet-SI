package tg.voyage_pro.reservation_pro.mappers;

import java.util.ArrayList;
import java.util.List;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;
import tg.voyage_pro.reservation_pro.Model.PAIEMENT;
import tg.voyage_pro.reservation_pro.dto.PaiementDTO;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2025-07-07T18:27:47+0000",
    comments = "version: 1.5.5.Final, compiler: javac, environment: Java 21.0.2 (Oracle Corporation)"
)
@Component
public class PaiementMapperImpl implements PaiementMapper {

    @Override
    public PAIEMENT toEntity(PaiementDTO dto) {
        if ( dto == null ) {
            return null;
        }

        PAIEMENT pAIEMENT = new PAIEMENT();

        pAIEMENT.setMontantPaiement( dto.getMontantPaiement() );
        pAIEMENT.setStatus( dto.getStatus() );
        pAIEMENT.setMethod( dto.getMethod() );
        pAIEMENT.setCodePaiement( dto.getCodePaiement() );
        pAIEMENT.setDatePaiement( dto.getDatePaiement() );

        pAIEMENT.setReservation( dto.getReservationId() != null ? new tg.voyage_pro.reservation_pro.Model.RESERVATION(dto.getReservationId()) : null );
        pAIEMENT.setAgent( dto.getAgentId() != null ? new tg.voyage_pro.reservation_pro.Model.AGENT(dto.getAgentId()) : null );

        return pAIEMENT;
    }

    @Override
    public PaiementDTO toDto(PAIEMENT entity) {
        if ( entity == null ) {
            return null;
        }

        PaiementDTO paiementDTO = new PaiementDTO();

        paiementDTO.setCodePaiement( entity.getCodePaiement() );
        paiementDTO.setReservation( entity.getReservation() );
        paiementDTO.setAgent( entity.getAgent() );
        paiementDTO.setDatePaiement( entity.getDatePaiement() );
        paiementDTO.setMontantPaiement( entity.getMontantPaiement() );
        paiementDTO.setStatus( entity.getStatus() );
        paiementDTO.setMethod( entity.getMethod() );

        paiementDTO.setReservationId( entity.getReservation() != null ? entity.getReservation().getIdReservation() : null );
        paiementDTO.setAgentId( entity.getAgent() != null ? entity.getAgent().getIdAgent() : null );

        return paiementDTO;
    }

    @Override
    public List<PaiementDTO> toListDto(List<PAIEMENT> list) {
        if ( list == null ) {
            return null;
        }

        List<PaiementDTO> list1 = new ArrayList<PaiementDTO>( list.size() );
        for ( PAIEMENT pAIEMENT : list ) {
            list1.add( toDto( pAIEMENT ) );
        }

        return list1;
    }
}
