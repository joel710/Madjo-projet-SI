package tg.voyage_pro.reservation_pro.mappers;

import java.util.ArrayList;
import java.util.List;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;
import tg.voyage_pro.reservation_pro.Model.AGENT;
import tg.voyage_pro.reservation_pro.dto.AgentDTO;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2025-07-07T18:27:47+0000",
    comments = "version: 1.5.5.Final, compiler: javac, environment: Java 21.0.2 (Oracle Corporation)"
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
        aGENT.setIdAgent( agentDto.getIdAgent() );
        aGENT.setNomAgent( agentDto.getNomAgent() );
        aGENT.setPrenomAgent( agentDto.getPrenomAgent() );
        aGENT.setSexeAgent( agentDto.getSexeAgent() );
        aGENT.setDateNaiss( agentDto.getDateNaiss() );
        aGENT.setTelAgent( agentDto.getTelAgent() );
        aGENT.setMailAgent( agentDto.getMailAgent() );

        return aGENT;
    }

    @Override
    public AgentDTO toDto(AGENT agent) {
        if ( agent == null ) {
            return null;
        }

        AgentDTO.AgentDTOBuilder agentDTO = AgentDTO.builder();

        agentDTO.password( agent.getPassword() );
        agentDTO.idAgent( agent.getIdAgent() );
        agentDTO.nomAgent( agent.getNomAgent() );
        agentDTO.prenomAgent( agent.getPrenomAgent() );
        agentDTO.sexeAgent( agent.getSexeAgent() );
        agentDTO.dateNaiss( agent.getDateNaiss() );
        agentDTO.telAgent( agent.getTelAgent() );
        agentDTO.mailAgent( agent.getMailAgent() );

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
