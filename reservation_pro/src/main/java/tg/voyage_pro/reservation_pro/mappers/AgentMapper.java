package tg.voyage_pro.reservation_pro.mappers;


import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Mappings;
import tg.voyage_pro.reservation_pro.Model.AGENT;
import tg.voyage_pro.reservation_pro.dto.AgentDTO;

import java.util.List;

@Mapper(componentModel="spring")
public interface AgentMapper {
    @Mappings({
        @Mapping(source = "password", target = "password")
    })
    AGENT toEntity(AgentDTO agentDto);

    @Mappings({
        @Mapping(source = "password", target = "password")
    })
    AgentDTO toDto(AGENT agent);

    List<AgentDTO> toListAgentDto(List<AGENT> agents);
}
