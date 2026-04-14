package docker_test.com.exception;

public class SimulatedRollbackException extends RuntimeException {

    public SimulatedRollbackException(String message) {
        super(message);
    }
}
