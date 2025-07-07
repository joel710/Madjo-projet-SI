package tg.voyage_pro.reservation_pro.mappers;

import java.util.ArrayList;
import java.util.List;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;
import tg.voyage_pro.reservation_pro.Model.AGENT;
import tg.voyage_pro.reservation_pro.dto.AgentDTO;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2025-07-07T21:23:37+0000",
    comments = "version: 1.5.5.Final, compiler: Eclipse JDT (IDE) 3.42.50.v20250628-1110, environment: Java 21.0.7 (Eclipse Adoptium)"
)
@Component
public class AgentMapperImpl implements AgentMapper {

    @Override
    public AGENT toEntity(AgentDTO agentDto) {
        if ( agentDto == null ) {
            return null;
        }

        AGENT aGENT = new AGENT();

        aGENT.setPassword( agentDto.getPassword() );
        aGENT.setDateNaiss( agentDto.getDateNaiss() );
        aGENT.setIdAgent( agentDto.getIdAgent() );
        aGENT.setMailAgent( agentDto.getMailAgent() );
        aGENT.setNomAgent( agentDto.getNomAgent() );
        aGENT.setPrenomAgent( agentDto.getPrenomAgent() );
        aGENT.setSexeAgent( agentDto.getSexeAgent() );
        aGENT.setTelAgent( agentDto.getTelAgent() );

        return aGENT;
    }

    @Override
    public AgentDTO toDto(AGENT agent) {
        if ( agent == null ) {
            return null;
        }

        AgentDTO.AgentDTOBuilder agentDTO = AgentDTO.builder();

        agentDTO.password( agent.getPassword() );
        agentDTO.dateNaiss( agent.getDateNaiss() );
        agentDTO.idAgent( agent.getIdAgent() );
        agentDTO.mailAgent( agent.getMailAgent() );
        agentDTO.nomAgent( agent.getNomAgent() );
        agentDTO.prenomAgent( agent.getPrenomAgent() );
        agentDTO.sexeAgent( agent.getSexeAgent() );
        agentDTO.telAgent( agent.getTelAgent() );

        return agentDTO.build();
    }

    @Override
    public List<AgentDTO> toListAgentDto(List<AGENT> agents) {
        if ( agents == null ) {
            return null;
        }

        List<AgentDTO> list = new ArrayList<AgentDTO>( agents.size() );
        for ( AGENT aGENT : agents ) {
            list.add( toDto( aGENT ) );
        }

        return list;
    }
}
