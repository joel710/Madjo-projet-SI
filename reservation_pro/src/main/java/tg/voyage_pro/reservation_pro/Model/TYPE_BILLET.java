package tg.voyage_pro.reservation_pro.Model;

import java.io.Serializable;
import java.util.List;

import jakarta.persistence.*;
import lombok.*;
import com.fasterxml.jackson.annotation.JsonIgnore;




@Entity
@Table(name = "type_billet")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString
public class TYPE_BILLET implements Serializable{

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idTypeBillet ; 
    @Column(name = "libelle_type_billet" , nullable = false)
    private String libelleTypeBillet ; 
    @Column(name = "prix_type_billet" , nullable = false)
    private Double prixTypeBillet ; 
    @OneToMany(mappedBy = "typeBillet"   ,  cascade=CascadeType.ALL)
    @JsonIgnore
    private List<RESERVATION> reservations ; 

}
