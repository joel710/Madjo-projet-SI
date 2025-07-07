package tg.voyage_pro.reservation_pro.Model;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.io.Serializable;
import java.util.Date;


@Entity
@Table(name = "paiement")
@Setter
@Getter

public class PAIEMENT implements Serializable {

    @Id
    @Column(name = "code_paiement" , nullable = false , length = 10)
    private  String codePaiement ;
    @ManyToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "reservation"  , nullable = false)
    @JsonIgnore
    private RESERVATION reservation ;
    @ManyToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "agent" , nullable = false)
    @JsonIgnore
    private AGENT agent ;

    @Column(name = "date_paiement" , nullable = false)
    @JsonFormat(shape = JsonFormat.Shape.STRING  , pattern = "yyyy-MM-dd" , timezone = "UTC")
    private Date datePaiement ;

    @Column(name = "montant_paiement" , nullable = false)
    private Double montantPaiement;
    
    @Column(name = "status" , nullable = false)
    private String status = "Payée";
    
    @Column(name = "method" , nullable = true)
    private String method;

}
