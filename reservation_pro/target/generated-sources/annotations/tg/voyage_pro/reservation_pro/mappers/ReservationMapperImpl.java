package tg.voyage_pro.reservation_pro.mappers;

import java.util.ArrayList;
import java.util.List;
import javax.annotation.processing.Generated;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import tg.voyage_pro.reservation_pro.Model.CLIENT;
import tg.voyage_pro.reservation_pro.Model.RESERVATION;
import tg.voyage_pro.reservation_pro.Model.TYPE_BILLET;
import tg.voyage_pro.reservation_pro.Model.VOYAGE;
import tg.voyage_pro.reservation_pro.dto.ReservationDTO;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2025-07-07T18:27:46+0000",
    comments = "version: 1.5.5.Final, compiler: javac, environment: Java 21.0.2 (Oracle Corporation)"
)
@Component
public class ReservationMapperImpl implements ReservationMapper {

    @Autowired
    private ClientMapper clientMapper;
    @Autowired
    private VoyageMapper voyageMapper;
    @Autowired
    private TypeBilletMapper typeBilletMapper;

    @Override
    public ReservationDTO toDto(RESERVATION entity) {
        if ( entity == null ) {
            return null;
        }

        ReservationDTO.ReservationDTOBuilder reservationDTO = ReservationDTO.builder();

        reservationDTO.idReservation( entity.getIdReservation() );
        reservationDTO.client( clientMapper.toDto( entity.getClient() ) );
        reservationDTO.voyage( voyageMapper.toDto( entity.getVoyage() ) );
        reservationDTO.typeBillet( typeBilletMapper.toDto( entity.getTypeBillet() ) );
        reservationDTO.nombrePlacesReservees( entity.getNombrePlacesReservees() );
        reservationDTO.status( entity.getStatus() );
        reservationDTO.idClient( entityClientIdClient( entity ) );
        reservationDTO.idVoyage( entityVoyageIdVoyage( entity ) );
        reservationDTO.idTypeBillet( entityTypeBilletIdTypeBillet( entity ) );
        reservationDTO.dateReservation( entity.getDateReservation() );

        return reservationDTO.build();
    }

    @Override
    public List<ReservationDTO> toListDto(List<RESERVATION> entities) {
        if ( entities == null ) {
            return null;
        }

        List<ReservationDTO> list = new ArrayList<ReservationDTO>( entities.size() );
        for ( RESERVATION rESERVATION : entities ) {
            list.add( toDto( rESERVATION ) );
        }

        return list;
    }

    @Override
    public RESERVATION toEntity(ReservationDTO dto) {
        if ( dto == null ) {
            return null;
        }

        RESERVATION.RESERVATIONBuilder rESERVATION = RESERVATION.builder();

        rESERVATION.client( reservationDTOToCLIENT( dto ) );
        rESERVATION.voyage( reservationDTOToVOYAGE( dto ) );
        rESERVATION.typeBillet( reservationDTOToTYPE_BILLET( dto ) );
        rESERVATION.idReservation( dto.getIdReservation() );
        rESERVATION.nombrePlacesReservees( dto.getNombrePlacesReservees() );
        rESERVATION.status( dto.getStatus() );
        rESERVATION.dateReservation( dto.getDateReservation() );

        return rESERVATION.build();
    }

    private Long entityClientIdClient(RESERVATION rESERVATION) {
        if ( rESERVATION == null ) {
            return null;
        }
        CLIENT client = rESERVATION.getClient();
        if ( client == null ) {
            return null;
        }
        Long idClient = client.getIdClient();
        if ( idClient == null ) {
            return null;
        }
        return idClient;
    }

    private Long entityVoyageIdVoyage(RESERVATION rESERVATION) {
        if ( rESERVATION == null ) {
            return null;
        }
        VOYAGE voyage = rESERVATION.getVoyage();
        if ( voyage == null ) {
            return null;
        }
        Long idVoyage = voyage.getIdVoyage();
        if ( idVoyage == null ) {
            return null;
        }
        return idVoyage;
    }

    private Long entityTypeBilletIdTypeBillet(RESERVATION rESERVATION) {
        if ( rESERVATION == null ) {
            return null;
        }
        TYPE_BILLET typeBillet = rESERVATION.getTypeBillet();
        if ( typeBillet == null ) {
            return null;
        }
        Long idTypeBillet = typeBillet.getIdTypeBillet();
        if ( idTypeBillet == null ) {
            return null;
        }
        return idTypeBillet;
    }

    protected CLIENT reservationDTOToCLIENT(ReservationDTO reservationDTO) {
        if ( reservationDTO == null ) {
            return null;
        }

        CLIENT.CLIENTBuilder cLIENT = CLIENT.builder();

        cLIENT.idClient( reservationDTO.getIdClient() );

        return cLIENT.build();
    }

    protected VOYAGE reservationDTOToVOYAGE(ReservationDTO reservationDTO) {
        if ( reservationDTO == null ) {
            return null;
        }

        VOYAGE.VOYAGEBuilder vOYAGE = VOYAGE.builder();

        vOYAGE.idVoyage( reservationDTO.getIdVoyage() );

        return vOYAGE.build();
    }

    protected TYPE_BILLET reservationDTOToTYPE_BILLET(ReservationDTO reservationDTO) {
        if ( reservationDTO == null ) {
            return null;
        }

        TYPE_BILLET.TYPE_BILLETBuilder tYPE_BILLET = TYPE_BILLET.builder();

        tYPE_BILLET.idTypeBillet( reservationDTO.getIdTypeBillet() );

        return tYPE_BILLET.build();
    }
}
