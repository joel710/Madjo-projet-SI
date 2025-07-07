package tg.voyage_pro.reservation_pro.exceptions;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.NOT_FOUND)
public class PaiementNotFoundException extends RuntimeException {
    public PaiementNotFoundException(String message) {
        super(message);
    }
} 