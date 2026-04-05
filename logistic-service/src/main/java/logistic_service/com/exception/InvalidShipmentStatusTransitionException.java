package logistic_service.com.exception;

public class InvalidShipmentStatusTransitionException extends RuntimeException {
    public InvalidShipmentStatusTransitionException(String message) {
        super(message);
    }
}
