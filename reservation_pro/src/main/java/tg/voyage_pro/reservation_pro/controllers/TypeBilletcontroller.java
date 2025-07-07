package tg.voyage_pro.reservation_pro.controllers;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import tg.voyage_pro.reservation_pro.Model.TYPE_BILLET;
import tg.voyage_pro.reservation_pro.core.TypeBilletService;
import tg.voyage_pro.reservation_pro.dto.TypeBilletDTO;
import tg.voyage_pro.reservation_pro.mappers.TypeBilletMapper;

@RestController
@RequestMapping(path = "/tg/voyage_pro/reservation/auth/ticket")
@CrossOrigin(origins = "*")
public class  TypeBilletcontroller {

    @Autowired
    private TypeBilletService service ; 
    @Autowired
    private TypeBilletMapper typeBilletMapper;

    @PostMapping(path = "/create")
    public TypeBilletDTO create(@RequestBody TypeBilletDTO typeDto){
        return this.service.create(typeDto) ; 
    }

    @GetMapping(path = "/getAll")
    public List<TypeBilletDTO> all(){
        return this.service.all() ;  
    }

    @GetMapping(path = "/get/{id}")
    public TypeBilletDTO get(@PathVariable Long id){
        return this.service.get(id) ; 

    }

    @PutMapping(path = "/update/{idType}")
    public  TypeBilletDTO update(@PathVariable Long idType , @RequestBody  TypeBilletDTO type){
        return this.service.update(idType , type);

    }

    @DeleteMapping(path="/delete/{id}")
    public boolean delete(@PathVariable Long id){
        return this.service.delete(id);
    }

}
