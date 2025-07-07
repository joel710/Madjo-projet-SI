package tg.voyage_pro.reservation_pro.mappers;

import java.util.ArrayList;
import java.util.List;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;
import tg.voyage_pro.reservation_pro.Model.TYPE_BILLET;
import tg.voyage_pro.reservation_pro.dto.TypeBilletDTO;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2025-07-07T18:27:47+0000",
    comments = "version: 1.5.5.Final, compiler: javac, environment: Java 21.0.2 (Oracle Corporation)"
)
@Component
public class TypeBilletMapperImpl implements TypeBilletMapper {

    @Override
    public TYPE_BILLET toEntity(TypeBilletDTO dto) {
        if ( dto == null ) {
            return null;
        }

        TYPE_BILLET.TYPE_BILLETBuilder tYPE_BILLET = TYPE_BILLET.builder();

        tYPE_BILLET.idTypeBillet( dto.getIdTypeBillet() );
        tYPE_BILLET.libelleTypeBillet( dto.getLibelleTypeBillet() );
        tYPE_BILLET.prixTypeBillet( dto.getPrixTypeBillet() );

        return tYPE_BILLET.build();
    }

    @Override
    public TypeBilletDTO toDto(TYPE_BILLET entity) {
        if ( entity == null ) {
            return null;
        }

        TypeBilletDTO.TypeBilletDTOBuilder typeBilletDTO = TypeBilletDTO.builder();

        typeBilletDTO.idTypeBillet( entity.getIdTypeBillet() );
        typeBilletDTO.libelleTypeBillet( entity.getLibelleTypeBillet() );
        typeBilletDTO.prixTypeBillet( entity.getPrixTypeBillet() );

        return typeBilletDTO.build();
    }

    @Override
    public List<TypeBilletDTO> toListDto(List<TYPE_BILLET> list) {
        if ( list == null ) {
            return null;
        }

        List<TypeBilletDTO> list1 = new ArrayList<TypeBilletDTO>( list.size() );
        for ( TYPE_BILLET tYPE_BILLET : list ) {
            list1.add( toDto( tYPE_BILLET ) );
        }

        return list1;
    }
}
