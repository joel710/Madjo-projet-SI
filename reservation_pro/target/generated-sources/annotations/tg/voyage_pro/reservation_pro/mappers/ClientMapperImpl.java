package tg.voyage_pro.reservation_pro.mappers;

import java.util.ArrayList;
import java.util.List;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;
import tg.voyage_pro.reservation_pro.Model.CLIENT;
import tg.voyage_pro.reservation_pro.dto.ClientDTO;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2025-07-07T18:27:47+0000",
    comments = "version: 1.5.5.Final, compiler: javac, environment: Java 21.0.2 (Oracle Corporation)"
)
@Component
public class ClientMapperImpl implements ClientMapper {

    @Override
    public CLIENT toEntity(ClientDTO clientDto) {
        if ( clientDto == null ) {
            return null;
        }

        CLIENT.CLIENTBuilder cLIENT = CLIENT.builder();

        cLIENT.idClient( clientDto.getIdClient() );
        cLIENT.nomClient( clientDto.getNomClient() );
        cLIENT.prenomClient( clientDto.getPrenomClient() );
        cLIENT.dateNaiss( clientDto.getDateNaiss() );
        cLIENT.mailClient( clientDto.getMailClient() );
        cLIENT.telClient( clientDto.getTelClient() );
        cLIENT.sexeClient( clientDto.getSexeClient() );
        cLIENT.login( clientDto.getLogin() );
        cLIENT.password( clientDto.getPassword() );

        return cLIENT.build();
    }

    @Override
    public ClientDTO toDto(CLIENT client) {
        if ( client == null ) {
            return null;
        }

        ClientDTO.ClientDTOBuilder clientDTO = ClientDTO.builder();

        clientDTO.idClient( client.getIdClient() );
        clientDTO.nomClient( client.getNomClient() );
        clientDTO.prenomClient( client.getPrenomClient() );
        clientDTO.dateNaiss( client.getDateNaiss() );
        clientDTO.mailClient( client.getMailClient() );
        clientDTO.telClient( client.getTelClient() );
        clientDTO.sexeClient( client.getSexeClient() );
        clientDTO.login( client.getLogin() );
        clientDTO.password( client.getPassword() );

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
