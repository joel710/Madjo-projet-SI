package tg.voyage_pro.reservation_pro.core;


    
    
    
    import org.springframework.beans.factory.annotation.Autowired;
    
    import org.springframework.stereotype.Service;
    import org.springframework.transaction.annotation.Transactional;
    
    
    import tg.voyage_pro.reservation_pro.Model.CLIENT;
    import tg.voyage_pro.reservation_pro.database.ClientRepository;
    import tg.voyage_pro.reservation_pro.dto.ClientDTO;
    import tg.voyage_pro.reservation_pro.dto.LoginRequest;
    import tg.voyage_pro.reservation_pro.exceptions.ClientNotFoundException;
    import tg.voyage_pro.reservation_pro.mappers.ClientMapper;
    


    import java.util.List;
    
    


    @Service
    @Transactional
    
    public class ClientService {
        @Autowired
        private   ClientRepository cr ;

        @Autowired
        private ClientMapper clientMapper;






        

        public CLIENT create(CLIENT client){
            return this.cr.save(client);
        
        }

        public ClientDTO login(LoginRequest loginRequest) {
            CLIENT client = cr.findByLoginAndPassword(loginRequest.getLogin(), loginRequest.getPassword());
            if (client == null) {
                throw new ClientNotFoundException("Invalid login or password");
            }
            return clientMapper.toDto(client);
        }


        public List<ClientDTO> getAllClient(){
            return   this.clientMapper.toListDto(this.cr.findAllOrderByIdClientDesc())   ;
            
        }

    /*  public List<ClientDTO> searchClient(ClientDTO client){
            return  this.clientMapper.toListDto(this.cr.searchClient(
                client.getNomClient(),
                client.getPrenomClient(),
                client.getMailClient(),
                client.getTelClient(),
                client.getMailClient(),
                client.getDateNaiss(),
                client.getSexeClient(),
            
            ));
        }*/


        public  ClientDTO getClient(Long idClient){
        
            var client = this.cr.findById(idClient).orElseThrow(()-> new ClientNotFoundException("client not found"));
            if(client == null){
                return null ;
            }
            return  this.clientMapper.toDto(client);

        }

        public  ClientDTO update(Long idClient ,     ClientDTO client){
    
            if(idClient == null){
                throw new NullPointerException("idClient est null");
            }
            CLIENT c = this.cr.findById(idClient).orElseThrow(()-> new ClientNotFoundException("Aucun client n'a ce numéro"));
            String login = c.getLogin();
            String password = c.getPassword();
            c =  this.clientMapper.toEntity(client) ; 
            c.setLogin(login);
            c.setPassword(password);
            System.out.println(c.toString());
            
            return  this.clientMapper.toDto(this.cr.save(c)) ;


        }

        public boolean delete(Long idClient){
            if(this.cr.existsById(idClient)){
                this.cr.deleteById(idClient); ;
                return true ;
            }
            return false ;
        }


        public List<ClientDTO> searchClient(ClientDTO client){
           
            return this.clientMapper.toListDto(this.cr.searchClient(
                client.getNomClient(),
                client.getMailClient(),
                client.getDateNaiss().toString(),
                client.getSexeClient(),
                client.getTelClient()
                 
            ));
        }

        public List<ClientDTO> refreshClient(){
            return this.clientMapper.toListDto(this.cr.findAllOrderByIdClientDesc());
        }





    }
