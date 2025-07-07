package tg.voyage_pro.reservation_pro.mappers;

import java.util.ArrayList;
import java.util.List;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;
import tg.voyage_pro.reservation_pro.Model.CLIENT;
import tg.voyage_pro.reservation_pro.dto.ClientDTO;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2025-07-07T21:23:39+0000",
    comments = "version: 1.5.5.Final, compiler: Eclipse JDT (IDE) 3.42.50.v20250628-1110, environment: Java 21.0.7 (Eclipse Adoptium)"
)
@Component
public class ClientMapperImpl implements ClientMapper {

    @Override
    public CLIENT toEntity(ClientDTO clientDto) {
        if ( clientDto == null ) {
            return null;
        }

        CLIENT.CLIENTBuilder cLIENT = CLIENT.builder();

        cLIENT.dateNaiss( clientDto.getDateNaiss() );
        cLIENT.idClient( clientDto.getIdClient() );
        cLIENT.login( clientDto.getLogin() );
        cLIENT.mailClient( clientDto.getMailClient() );
        cLIENT.nomClient( clientDto.getNomClient() );
        cLIENT.password( clientDto.getPassword() );
        cLIENT.prenomClient( clientDto.getPrenomClient() );
        cLIENT.sexeClient( clientDto.getSexeClient() );
        cLIENT.telClient( clientDto.getTelClient() );

        return cLIENT.build();
    }

    @Override
    public ClientDTO toDto(CLIENT client) {
        if ( client == null ) {
            return null;
        }

        ClientDTO.ClientDTOBuilder clientDTO = ClientDTO.builder();

        clientDTO.dateNaiss( client.getDateNaiss() );
        clientDTO.idClient( client.getIdClient() );
        clientDTO.login( client.getLogin() );
        clientDTO.mailClient( client.getMailClient() );
        clientDTO.nomClient( client.getNomClient() );
        clientDTO.password( client.getPassword() );
        clientDTO.prenomClient( client.getPrenomClient() );
        clientDTO.sexeClient( client.getSexeClient() );
        clientDTO.telClient( client.getTelClient() );

        return clientDTO.build();
    }

    @Override
    public List<ClientDTO> toListDto(List<CLIENT> list) {
        if ( list == null ) {
            return null;
        }

        List<ClientDTO> list1 = new ArrayList<ClientDTO>( list.size() );
        for ( CLIENT cLIENT : list ) {
            list1.add( toDto( cLIENT ) );
        }

        return list1;
    }
}
