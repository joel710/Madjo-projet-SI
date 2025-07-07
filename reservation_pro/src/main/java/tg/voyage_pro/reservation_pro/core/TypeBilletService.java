package tg.voyage_pro.reservation_pro.core;

 
import java.util.List;
 
import org.springframework.beans.factory.annotation.Autowired;
 
import org.springframework.stereotype.Service;

import tg.voyage_pro.reservation_pro.Model.TYPE_BILLET;
import tg.voyage_pro.reservation_pro.database.TypeBilletRepository;
import tg.voyage_pro.reservation_pro.dto.TypeBilletDTO;
import tg.voyage_pro.reservation_pro.mappers.TypeBilletMapper;

@Service
public class TypeBilletService {
    @Autowired
    private TypeBilletRepository repo ; 

    @Autowired
    private TypeBilletMapper  mapper;

    public TypeBilletDTO create(TypeBilletDTO dto) {
        TYPE_BILLET entity = mapper.toEntity(dto);
        TYPE_BILLET saved = repo.save(entity);
        return mapper.toDto(saved);
    }

    public List<TypeBilletDTO> all() {
        List<TYPE_BILLET> entities = repo.findAll();
        return mapper.toListDto(entities);
    }

    public boolean delete(Long idType){
        if(this.repo.existsById(idType)){
            this.repo.deleteById(idType);
            return true ; 
        }
        return false  ;
    }

    public   TypeBilletDTO update( Long idType ,    TypeBilletDTO type){

        TYPE_BILLET  t = this.repo.findById(idType).orElse(null);

        if(t == null){
            return null ;
        }
        var id  = t.getIdTypeBillet() ; 
        t =  this.mapper.toEntity(type) ; 
        t.setIdTypeBillet(id);

     

        return this.mapper.toDto(this.repo.save(t));
    }

    public TypeBilletDTO get(Long id) {
        TYPE_BILLET entity = repo.findById(id).orElseThrow();
        return mapper.toDto(entity);
    }
}
