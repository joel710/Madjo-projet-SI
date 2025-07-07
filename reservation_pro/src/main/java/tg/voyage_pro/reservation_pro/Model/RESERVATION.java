package tg.voyage_pro.reservation_pro.Model;

import java.io.Serializable;
import java.sql.Date;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;
 



@Entity
@Table(name = "reservation")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString

public class RESERVATION implements Serializable{
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idReservation ; 

    @ManyToOne 
    @JoinColumn(name="client_id")
    @JsonIgnore
    private CLIENT client ; 

    @ManyToOne 
    @JoinColumn(name = "voyage_id")
    @JsonIgnore
    private VOYAGE voyage ; 

    private Integer nombrePlacesReservees;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd", timezone = "UTC")
    private Date dateReservation ; 

    @ManyToOne
    @JoinColumn(name = "type_billet_id" )
    @JsonIgnore
    private TYPE_BILLET typeBillet ;

    @OneToMany(mappedBy = "reservation", cascade = CascadeType.ALL)
    @JsonIgnore
    private List<PAIEMENT> paiementList ;

    private String status = "PENDING";

    public RESERVATION(Long idReservation) {
        this.idReservation = idReservation;
    }

    public void setNombrePlacesReservees(Integer nombrePlacesReservees) {
        this.nombrePlacesReservees = nombrePlacesReservees;
    }






    

}
