package tg.voyage_pro.reservation_pro.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tg.voyage_pro.reservation_pro.Model.PAIEMENT;
import tg.voyage_pro.reservation_pro.core.PaiementService;
import tg.voyage_pro.reservation_pro.dto.PaiementDTO;
import tg.voyage_pro.reservation_pro.mappers.PaiementMapper;

import java.util.List;

@RestController
@RequestMapping("/tg/voyage_pro/reservation/auth/paiement")
@CrossOrigin("*")
public class PaiementController {

    @Autowired
    private PaiementService paiementService;

    @Autowired
    private PaiementMapper paiementMapper;

    @PostMapping("/create")
    public ResponseEntity<PaiementDTO> create(@RequestBody PaiementDTO paiementDTO) {
        System.out.println("[DEBUG] Paiement reçu: reservationId=" + paiementDTO.getReservationId() + ", agentId=" + paiementDTO.getAgentId());
        PAIEMENT paiementEntity = paiementMapper.toEntity(paiementDTO);
        PaiementDTO savedPaiementDTO = paiementService.create(paiementEntity);
        return new ResponseEntity<>(savedPaiementDTO, HttpStatus.CREATED);
    }

    @GetMapping({"", "/getAll"})
    public ResponseEntity<List<PaiementDTO>> getAllPaiements() {
        List<PaiementDTO> paiementDTOs = paiementService.getAll();
        return new ResponseEntity<>(paiementDTOs, HttpStatus.OK);
    }

    @GetMapping("/get/{codePaiement}")
    public ResponseEntity<PaiementDTO> getPaiementByCode(@PathVariable String codePaiement) {
        PaiementDTO paiementDTO = paiementService.get(codePaiement);
        if (paiementDTO == null) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        return new ResponseEntity<>(paiementDTO, HttpStatus.OK);
    }

    @PutMapping("/update/{codePaiement}")
    public ResponseEntity<PaiementDTO> updatePaiement(@PathVariable String codePaiement, @RequestBody PaiementDTO paiementDTO) {
        PAIEMENT paiementEntityFromPayload = paiementMapper.toEntity(paiementDTO);
        PaiementDTO updatedPaiementDTO = paiementService.update(codePaiement, paiementEntityFromPayload);

        if (updatedPaiementDTO == null) {
             return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        return new ResponseEntity<>(updatedPaiementDTO, HttpStatus.OK);
    }

    @DeleteMapping("/delete/{codePaiement}")
    public ResponseEntity<Void> deletePaiement(@PathVariable String codePaiement) {
        boolean deleted = paiementService.delete(codePaiement);
        if (deleted) {
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }
} 