package tg.voyage_pro.reservation_pro.core;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import tg.voyage_pro.reservation_pro.Model.AGENT;
import tg.voyage_pro.reservation_pro.Model.PAIEMENT;
import tg.voyage_pro.reservation_pro.Model.RESERVATION;
import tg.voyage_pro.reservation_pro.database.AgentRepository;
import tg.voyage_pro.reservation_pro.database.PaiementRepository;
import tg.voyage_pro.reservation_pro.database.ReservationRepository;
import tg.voyage_pro.reservation_pro.exceptions.NullValueException;
import tg.voyage_pro.reservation_pro.exceptions.PaiementNotFoundException;
import tg.voyage_pro.reservation_pro.mappers.PaiementMapper;
import tg.voyage_pro.reservation_pro.dto.PaiementDTO;

import java.util.List;

@Service
public class PaiementService {

    @Autowired
    private PaiementRepository pr;

    @Autowired
    private AgentRepository ar;

    @Autowired
    private ReservationRepository rr;

    @Autowired
    private PaiementMapper paiementMapper;

    public PaiementDTO create(PAIEMENT paiement) {
        // Fetch associated entities to ensure they exist
        if (paiement.getAgent() == null || paiement.getAgent().getIdAgent() == null) {
            throw new NullValueException("Agent information is missing for payment.");
        }
        if (paiement.getReservation() == null || paiement.getReservation().getIdReservation() == null) {
            throw new NullValueException("Reservation information is missing for payment.");
        }

        AGENT agent = ar.findById(paiement.getAgent().getIdAgent())
                .orElseThrow(() -> new NullValueException("Agent not found for ID: " + paiement.getAgent().getIdAgent()));
        RESERVATION reservation = rr.findById(paiement.getReservation().getIdReservation())
                .orElseThrow(() -> new NullValueException("Reservation not found for ID: " + paiement.getReservation().getIdReservation()));

        paiement.setAgent(agent);
        paiement.setReservation(reservation);
        
        // Set default values if not provided
        if (paiement.getStatus() == null) {
            paiement.setStatus("Payée");
        }
        if (paiement.getMethod() == null) {
            paiement.setMethod("Carte bancaire");
        }
        
        PAIEMENT savedPaiement = pr.save(paiement);
        return paiementMapper.toDto(savedPaiement);
    }

    public List<PaiementDTO> getAll() {
        List<PAIEMENT> paiements = pr.findAll();
        return paiementMapper.toListDto(paiements);
    }

    public PaiementDTO get(String codePaiement) {
        PAIEMENT paiement = pr.findById(codePaiement)
                .orElseThrow(() -> new PaiementNotFoundException("Paiement not found with code: " + codePaiement));
        return paiementMapper.toDto(paiement);
    }

    public PaiementDTO update(String codePaiement, PAIEMENT paiementDetails) {
        PAIEMENT existingPaiement = pr.findById(codePaiement)
                .orElseThrow(() -> new PaiementNotFoundException("Paiement not found with code: " + codePaiement));

        // Update fields
        existingPaiement.setDatePaiement(paiementDetails.getDatePaiement());
        existingPaiement.setMontantPaiement(paiementDetails.getMontantPaiement());
        existingPaiement.setStatus(paiementDetails.getStatus());
        existingPaiement.setMethod(paiementDetails.getMethod());

        // If you need to update agent or reservation, you'd do something like:
        // if (paiementDetails.getAgent() != null && paiementDetails.getAgent().getIdAgent() != null) {
        //     AGENT updatedAgent = ar.findById(paiementDetails.getAgent().getIdAgent())
        //             .orElseThrow(() -> new NullValueException("Agent not found for ID: " + paiementDetails.getAgent().getIdAgent()));
        //     existingPaiement.setAgent(updatedAgent);
        // }
        // if (paiementDetails.getReservation() != null && paiementDetails.getReservation().getIdReservation() != null) {
        //     RESERVATION updatedReservation = rr.findById(paiementDetails.getReservation().getIdReservation())
        //             .orElseThrow(() -> new NullValueException("Reservation not found for ID: " + paiementDetails.getReservation().getIdReservation()));
        //     existingPaiement.setReservation(updatedReservation);
        // }

        PAIEMENT updatedPaiement = pr.save(existingPaiement);
        return paiementMapper.toDto(updatedPaiement);
    }

    public boolean delete(String codePaiement) {
        if (pr.existsById(codePaiement)) {
            pr.deleteById(codePaiement);
            return true;
        }
        return false;
    }
}
