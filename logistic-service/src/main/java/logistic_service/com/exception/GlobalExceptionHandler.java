package logistic_service.com.exception;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.ServletWebRequest;
import org.springframework.web.context.request.WebRequest;

import logistic_service.com.dto.ApiErrorEnvelope;
import logistic_service.com.dto.ApiErrorResponse;
import logistic_service.com.enums.ShipmentStatus;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(InvalidShipmentStatusTransitionException.class)
    public ResponseEntity<ApiErrorEnvelope> handleInvalidStatusTransition(
            InvalidShipmentStatusTransitionException ex,
            WebRequest request) {
        return buildErrorResponse(HttpStatus.BAD_REQUEST, "INVALID_SHIPMENT_STATUS_TRANSITION", ex.getMessage(), request);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ApiErrorEnvelope> handleIllegalArgumentException(
            IllegalArgumentException ex,
            WebRequest request) {
        return buildErrorResponse(HttpStatus.NOT_FOUND, "RESOURCE_NOT_FOUND", ex.getMessage(), request);
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ApiErrorEnvelope> handleHttpMessageNotReadable(
            HttpMessageNotReadableException ex,
            WebRequest request) {
        String message = "Invalid request body.";
        
        // Provide helpful error message for common JSON format issues
        if (ex.getMessage() != null) {
            if (ex.getMessage().contains("Unexpected character") && 
                ex.getMessage().contains("code 39")) {
                // Code 39 is single quote (')
                message = "JSON Format Error: Use double quotes (\") not single quotes ('). " +
                         "Example: {\"status\": \"IN_TRANSIT\"} not {'status': 'IN_TRANSIT'}";
            } else if (ex.getMessage().contains("ShipmentStatus")) {
                String allowedStatuses = Arrays.stream(ShipmentStatus.values())
                        .map(Enum::name)
                        .collect(Collectors.joining(", "));
                message = "Invalid status value. Allowed values: " + allowedStatuses;
            } else if (ex.getMessage().contains("Required request body")) {
                message = "Missing Request Body: Please provide JSON with status and description fields.";
            }
        }
        return buildErrorResponse(HttpStatus.BAD_REQUEST, "INVALID_REQUEST_BODY", message, request);
    }

    @ExceptionHandler(Exception.class)
        public ResponseEntity<ApiErrorEnvelope> handleUnexpectedException(
            Exception ex,
            WebRequest request) {
        return buildErrorResponse(HttpStatus.INTERNAL_SERVER_ERROR, "INTERNAL_SERVER_ERROR",
                "Unexpected server error.", request);
    }

        private ResponseEntity<ApiErrorEnvelope> buildErrorResponse(
            HttpStatus status,
            String code,
            String message,
            WebRequest request) {
        String path = request instanceof ServletWebRequest servletWebRequest
                ? servletWebRequest.getRequest().getRequestURI()
                : "";

        ApiErrorResponse response = new ApiErrorResponse(
                code,
                message,
                LocalDateTime.now(),
                path);

        return ResponseEntity.status(status).body(ApiErrorEnvelope.of(response));
    }
}
