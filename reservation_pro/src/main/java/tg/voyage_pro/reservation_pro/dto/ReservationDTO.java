package tg.voyage_pro.reservation_pro.dto;

import java.sql.Date;

import com.fasterxml.jackson.annotation.JsonProperty;
 
import lombok.*;
 

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@ToString
@Builder
public class ReservationDTO {
    private Long idReservation ; 

    @JsonProperty("clientId")
    private Long idClient ; 

    @JsonProperty("voyageId")
    private Long idVoyage ; 

    @JsonProperty("typeBilletId")
    private Long idTypeBillet ; 

    private Integer nombrePlacesReservees;

    private Date dateReservation ; 

    private String status;

    private ClientDTO client;
    private VoyageDTO voyage;
    private TypeBilletDTO typeBillet;
}
