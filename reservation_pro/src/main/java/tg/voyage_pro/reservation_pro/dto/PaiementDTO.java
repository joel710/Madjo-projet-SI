package tg.voyage_pro.reservation_pro.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
 
import tg.voyage_pro.reservation_pro.Model.AGENT;
import tg.voyage_pro.reservation_pro.Model.RESERVATION;

import java.util.Date;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PaiementDTO {

    private String codePaiement ;

    private RESERVATION reservation ;

    private AGENT agent ;
 
    @JsonFormat(shape = JsonFormat.Shape.STRING  , pattern = "yyyy-MM-dd" , timezone = "UTC")
    private Date datePaiement ;
    
    private Double montantPaiement;
    
    private String status;
    
    private String method;
    
    // Champs pour faciliter la création depuis le frontend
    private Long reservationId;
    
    private Long agentId;

}
