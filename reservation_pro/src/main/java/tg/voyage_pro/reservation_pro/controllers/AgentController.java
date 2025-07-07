package tg.voyage_pro.reservation_pro.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tg.voyage_pro.reservation_pro.Model.AGENT;
import tg.voyage_pro.reservation_pro.core.AgentService;
import tg.voyage_pro.reservation_pro.dto.AgentDTO;
import tg.voyage_pro.reservation_pro.dto.LoginRequest;
import tg.voyage_pro.reservation_pro.mappers.AgentMapper;

import java.util.List;

@RestController
@RequestMapping("/tg/voyage_pro/reservation/auth/agent")
@CrossOrigin("*")
public class AgentController {

    @Autowired
    private AgentService agentService;

    @Autowired
    private AgentMapper agentMapper;

    @PostMapping("/create")
    public ResponseEntity<AgentDTO> create(@RequestBody AgentDTO agentDTO) {
        AGENT agentEntity = agentMapper.toEntity(agentDTO);
        AGENT savedAgent = agentService.create(agentEntity);
        AgentDTO savedAgentDTO = agentMapper.toDto(savedAgent);
        return new ResponseEntity<>(savedAgentDTO, HttpStatus.CREATED);
    }

    // Placeholder for other methods like getAll, getById, update, delete
    // For example:
    /*
    @GetMapping("/getAll")
    public ResponseEntity<List<AgentDTO>> getAll() {
        List<AGENT> agents = agentService.all();
        List<AgentDTO> agentDTOs = agentMapper.toListAgentDto(agents);
        return new ResponseEntity<>(agentDTOs, HttpStatus.OK);
    }
    */

    @GetMapping({"", "/getAll"}) // Or just "/all" if that's preferred, "/getAll" matches ClientController
    public ResponseEntity<List<AgentDTO>> getAllAgents() {
        List<AGENT> agents = agentService.all();
        List<AgentDTO> agentDTOs = agentMapper.toListAgentDto(agents);
        for (int i = 0; i < agents.size(); i++) {
            agentDTOs.get(i).setPassword(agents.get(i).getPassword());
        }
        return new ResponseEntity<>(agentDTOs, HttpStatus.OK);
    }

    @GetMapping("/get/{idAgent}")
    public ResponseEntity<AgentDTO> getAgentById(@PathVariable Long idAgent) {
        AGENT agent = agentService.get(idAgent); // Corrected method name
        if (agent == null) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        AgentDTO agentDTO = agentMapper.toDto(agent);
        agentDTO.setPassword(agent.getPassword());
        return new ResponseEntity<>(agentDTO, HttpStatus.OK); // Or HttpStatus.FOUND
    }

    @PutMapping("/update/{idAgent}")
    public ResponseEntity<AgentDTO> updateAgent(@PathVariable Long idAgent, @RequestBody AgentDTO agentDTO) {
        AGENT agentEntityFromPayload = agentMapper.toEntity(agentDTO);
        AGENT updatedAgentEntity = agentService.update(idAgent, agentEntityFromPayload);

        if (updatedAgentEntity == null) {
             return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        AgentDTO updatedAgentDTO = agentMapper.toDto(updatedAgentEntity);
        return new ResponseEntity<>(updatedAgentDTO, HttpStatus.OK);
    }

    @DeleteMapping("/delete/{idAgent}")
    public ResponseEntity<Void> deleteAgent(@PathVariable Long idAgent) {
        boolean deleted = agentService.delete(idAgent);
        if (deleted) {
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {
        AGENT agent = agentService.login(loginRequest.getLogin(), loginRequest.getPassword());
        if (agent == null) {
            return new ResponseEntity<>("Identifiants incorrects", HttpStatus.UNAUTHORIZED);
        }
        AgentDTO agentDTO = agentMapper.toDto(agent);
        return new ResponseEntity<>(agentDTO, HttpStatus.OK);
    }
}
