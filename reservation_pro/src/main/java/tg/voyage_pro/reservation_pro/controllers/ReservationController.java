package tg.voyage_pro.reservation_pro.controllers;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;

import java.util.Map;
 
import tg.voyage_pro.reservation_pro.Model.RESERVATION;
import tg.voyage_pro.reservation_pro.core.ReservationService;
import tg.voyage_pro.reservation_pro.dto.ReservationDTO;
import tg.voyage_pro.reservation_pro.mappers.ReservationMapper;

@RestController
@RequestMapping(path = "/tg/voyage_pro/reservation/auth/reservation")
public class ReservationController {

    @Autowired
    private ReservationService service ; 

    @Autowired
    private ReservationMapper reservationMapper;

    @PostMapping(path="/create")
    public ResponseEntity<ReservationDTO> create(@RequestBody ReservationDTO reservation){
        RESERVATION saved = this.service.create(reservation) ;
        ReservationDTO dto = reservationMapper.toDto(saved);
        System.out.println("[DEBUG] Reservation créée: id=" + dto.getIdReservation() + ", nombrePlacesReservees=" + dto.getNombrePlacesReservees() + ", status=" + dto.getStatus());
        return new ResponseEntity<>(dto, HttpStatus.CREATED);
    }


    @GetMapping(path = "/all")
    public List<ReservationDTO> all(){
        return this.service.getAll() ;
    }

    @PutMapping(path = "/update") // Corrected from @GetMapping to @PutMapping
    public ReservationDTO update(@RequestBody ReservationDTO reservation){
        return this.service.update(reservation) ; 
    }

    @PutMapping(path = "/{id}/status")
    public ReservationDTO updateReservationStatus(@PathVariable Long id, @RequestBody Map<String, String> statusUpdate) {
        String newStatus = statusUpdate.get("status");
        if (newStatus == null || newStatus.trim().isEmpty()) {
            throw new IllegalArgumentException("Status cannot be null or empty in the request body.");
        }
        return this.service.updateStatus(id, newStatus);
    }

    @DeleteMapping(path = "/delete/{id}")
    public boolean delete(@PathVariable Long id){
        return this.service.delete(id);
    }

}
