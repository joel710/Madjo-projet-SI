package tg.voyage_pro.reservation_pro.Model;


import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.Date;
import java.util.List;

@Entity
@Setter
@Getter
@Table(name="agent")
public class AGENT {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_agent")
    private Long idAgent ;
    @Column(name = "nom_agent" , length = 75 , nullable = false)
    private String nomAgent ;
    @Column(name = "prenom_agent" , length = 75)
    private String prenomAgent ;
    @Column(name = "sexe_agent" , nullable = false , length = 1)
    private String sexeAgent ;
    @JsonFormat(shape = JsonFormat.Shape.STRING , pattern = "dd/mm/yyyy" , timezone = "UTC")
    @Column(name = "date_naiss" , nullable = false)
    private Date dateNaiss ;
    @Column(name = "tel_agent" , nullable = false , length = 20)
    private String  telAgent ;
    @Column(name = "mail_agent" , nullable = false , length = 20)
    private String  mailAgent ;
    @Column(name = "password", nullable = false, length = 50)
    private String password;
    @OneToMany(mappedBy = "agent" , cascade = CascadeType.ALL)
    @JsonIgnore
    private List<PAIEMENT> paiementList ;

    public AGENT(Long idAgent) {
        this.idAgent = idAgent;
    }

    public AGENT() {
        // Constructeur par défaut requis par JPA
    }

}
