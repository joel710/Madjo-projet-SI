package tg.voyage_pro.reservation_pro.core;

import java.util.List;
import java.util.stream.Collectors;
 
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
 
import tg.voyage_pro.reservation_pro.Model.CLIENT;
import tg.voyage_pro.reservation_pro.Model.RESERVATION;
import tg.voyage_pro.reservation_pro.Model.TYPE_BILLET;
import tg.voyage_pro.reservation_pro.Model.VOYAGE;
import tg.voyage_pro.reservation_pro.database.*;
import tg.voyage_pro.reservation_pro.dto.ReservationDTO;
import tg.voyage_pro.reservation_pro.dto.ClientDTO;
import tg.voyage_pro.reservation_pro.dto.VoyageDTO;
import tg.voyage_pro.reservation_pro.dto.TypeBilletDTO;
import tg.voyage_pro.reservation_pro.exceptions.ClientNotFoundException;
import tg.voyage_pro.reservation_pro.exceptions.NullValueException;
import tg.voyage_pro.reservation_pro.exceptions.ReservationNotFoundException;
import tg.voyage_pro.reservation_pro.exceptions.VoyageNotFoundException;
import tg.voyage_pro.reservation_pro.mappers.ReservationMapper;
import tg.voyage_pro.reservation_pro.mappers.ClientMapper;
import tg.voyage_pro.reservation_pro.mappers.VoyageMapper;
import tg.voyage_pro.reservation_pro.mappers.TypeBilletMapper;

@Service
public class ReservationService {


    @Autowired
    private ReservationRepository rsr ;

    @Autowired
    private ClientRepository cr ; 

    @Autowired
    private VoyageRepository vr ; 

    @Autowired
    private TypeBilletRepository tbr;

    @Autowired
    private ReservationMapper reservationMapper;

    @Autowired
    private ClientMapper clientMapper;

    @Autowired
    private VoyageMapper voyageMapper;

    @Autowired
    private TypeBilletMapper typeBilletMapper;

    @PersistenceContext
    private EntityManager entityManager;

    public  RESERVATION create(ReservationDTO reservationDto){

        if (reservationDto.getIdClient() == null) {
            throw new NullValueException("L'ID du client ne doit pas être nul.");
        }
       CLIENT client = this.cr.findById(reservationDto.getIdClient()).orElseThrow(()-> new NullValueException("Client introuvable avec l'ID: " + reservationDto.getIdClient())) ; 

       if (reservationDto.getIdVoyage() == null) {
            throw new NullValueException("L'ID du voyage ne doit pas être nul.");
        }
       VOYAGE voyage = this.vr.findById( reservationDto.getIdVoyage()).orElseThrow(()-> new NullValueException( "Voyage introuvable avec l'ID: " + reservationDto.getIdVoyage()));

       if (reservationDto.getIdTypeBillet() == null) {
            throw new NullValueException("L'ID du type de billet ne doit pas être nul.");
        }
       TYPE_BILLET type = this.tbr.findById(reservationDto.getIdTypeBillet()).orElseThrow( ()-> new NullValueException("Type de billet introuvable avec l'ID: " + reservationDto.getIdTypeBillet()));

       if(reservationDto.getDateReservation() == null){
            throw new NullValueException("La date de réservation ne doit pas être nulle.") ; 
       }

        RESERVATION reservationEntity = reservationMapper.toEntity(reservationDto);
        reservationEntity.setClient(client);
        reservationEntity.setVoyage(voyage);
        reservationEntity.setTypeBillet(type);
        reservationEntity.setNombrePlacesReservees(reservationDto.getNombrePlacesReservees());

        if (reservationDto.getStatus() != null && !reservationDto.getStatus().isEmpty()) {
            reservationEntity.setStatus(reservationDto.getStatus());
        } else {
            reservationEntity.setStatus("PENDING");
        }

        RESERVATION saved = this.rsr.save(reservationEntity);
        // entityManager.flush();
        // entityManager.refresh(saved);
        System.out.println("ID généré après save = " + saved.getIdReservation());
        System.out.println("Enregistré en base - nombrePlacesReservees = " + saved.getNombrePlacesReservees());
        return saved;
        

        
    }

    public boolean delete(Long IdReservation){

        if(!this.rsr.existsById(IdReservation)){
            return false ;
        }
        
        this.rsr.deleteById(IdReservation);
        return true ; 
    }


    
    
    public List<ReservationDTO> getAll(){
        List<RESERVATION> reservations = this.rsr.findAll();
        List<ReservationDTO> dtos = this.reservationMapper.toListDto(reservations);
        for (int i = 0; i < reservations.size(); i++) {
            RESERVATION r = reservations.get(i);
            ReservationDTO dto = dtos.get(i);
            if (r.getClient() != null) dto.setClient(clientMapper.toDto(r.getClient()));
            if (r.getVoyage() != null) dto.setVoyage(voyageMapper.toDto(r.getVoyage()));
            if (r.getTypeBillet() != null) dto.setTypeBillet(typeBilletMapper.toDto(r.getTypeBillet()));
        }
        return dtos;
    }

    public ReservationDTO get(Long idReservation){
        RESERVATION r =  this.rsr.findById(idReservation).orElseThrow(()-> new ReservationNotFoundException("Reservation not found")) ; 
        
        return this.reservationMapper.toDto(r);
    }


    public ReservationDTO update(ReservationDTO r){
        RESERVATION res =  this.rsr.findById(r.getIdReservation()).orElseThrow(()-> new  ReservationNotFoundException("Reservation not found")) ; 

        VOYAGE v = this.vr.findById(r.getIdVoyage()).orElseThrow(()-> new VoyageNotFoundException("voyage not found"));

        CLIENT c = this.cr.findById(r.getIdClient()).orElseThrow(()-> new ClientNotFoundException("Client not found"));

        TYPE_BILLET typeBillet = this.tbr.findById(r.getIdTypeBillet()).orElseThrow(() -> new NullValueException("Type Billet not found"));

        res.setDateReservation(r.getDateReservation());
        res.setClient(c);
        res.setVoyage(v);
        res.setTypeBillet(typeBillet);
        res.setNombrePlacesReservees(r.getNombrePlacesReservees());
        res.setStatus(r.getStatus());

        this.rsr.save(res) ; 


        return this.reservationMapper.toDto(res);




    }
    
   
    public ReservationDTO updateStatus(Long idReservation, String status) {
        RESERVATION reservation = this.rsr.findById(idReservation)
            .orElseThrow(() -> new ReservationNotFoundException("Reservation not found with id: " + idReservation));
        reservation.setStatus(status);
        this.rsr.save(reservation);
        return this.reservationMapper.toDto(reservation);
    }
}
