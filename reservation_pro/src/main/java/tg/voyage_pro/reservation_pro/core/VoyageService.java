package tg.voyage_pro.reservation_pro.core;

import java.util.List;
 
 

import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import jakarta.transaction.Transactional;
 
import tg.voyage_pro.reservation_pro.Model.VOYAGE;
import tg.voyage_pro.reservation_pro.database.VoyageRepository;
import tg.voyage_pro.reservation_pro.dto.VoyageDTO;
import tg.voyage_pro.reservation_pro.exceptions.VoyageNotFoundException;
import tg.voyage_pro.reservation_pro.mappers.VoyageMapper; // Changed import


@Service
@Transactional
 
public class VoyageService {

    @Autowired
    private VoyageRepository vr ;

    @Autowired // Added Autowired
    private VoyageMapper mapper; // Changed type and removed manual instantiation

    @Autowired
    private VoyageMapper voyageMapper;


 

   


    public VoyageDTO create(VoyageDTO voyage){
        return this.mapper.toDto(
                this.vr.save(this.mapper.toEntity(voyage)));
    }



    public List<VoyageDTO> getAll(){
        return this.mapper.toDtos(this.vr.findAllByOrderByDateVoyageDesc()) ;
    }
        


    public VoyageDTO update(Long idVoyage ,   VoyageDTO voyage){

        if(!this.vr.existsById(idVoyage)){
            throw new VoyageNotFoundException("Aucun voyage n 'a ce numéro");
        }

        VOYAGE v = this.vr.findById(idVoyage).get() ;
         
        v.setDateVoyage(voyage.getDateVoyage());
        v.setDepartVoyage(voyage.getDepartVoyage());
        v.setArriveVoyage(voyage.getArriveVoyage());
        v.setHeureDepart(voyage.getHeureDepart());
        v.setHeureArrivee(voyage.getHeureArrivee());
        return this.mapper.toDto(this.vr.save(v)) ; 
        

        
 
    }

    public boolean delete(Long idVoyage){
        if(this.vr.existsById(idVoyage)){
            this.vr.deleteById(idVoyage);
            return true ; 
        }
        return false ; 
    }


    public  VOYAGE get(Long idVoyage){
        return this.vr.findById(idVoyage).orElse(null);

    }

    public VoyageDTO getDto(Long id) {
        VOYAGE v = this.get(id); // ou findById(id) selon votre code
        return voyageMapper.toDto(v);
    }
}
