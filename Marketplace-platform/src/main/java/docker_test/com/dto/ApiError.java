package docker_test.com.dto;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;

/** Phan hoi loi API chuan cho toan bo backend. */
public class ApiError {
    private int status;
    private String error;
    private String message;
    private String path;
    private Instant timestamp;
    private Map<String, String> fieldErrors;
    private String traceId;

    public ApiError() {
        this.timestamp = Instant.now();
        this.fieldErrors = new LinkedHashMap<>();
    }

    public ApiError(int status, String error, String message, String path) {
        this();
        this.status = status;
        this.error = error;
        this.message = message;
        this.path = path;
    }

    public void addFieldError(String field, String message) {
        this.fieldErrors.put(field, message);
    }

    public int getStatus() {
        return status;
    }

    public void setStatus(int status) {
        this.status = status;
    }

    public String getError() {
        return error;
    }

    public void setError(String error) {
        this.error = error;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getPath() {
        return path;
    }

    public void setPath(String path) {
        this.path = path;
    }

    public Instant getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(Instant timestamp) {
        this.timestamp = timestamp;
    }

    public Map<String, String> getFieldErrors() {
        return fieldErrors;
    }

    public void setFieldErrors(Map<String, String> fieldErrors) {
        this.fieldErrors = fieldErrors;
    }

    public String getTraceId() {
        return traceId;
    }

    public void setTraceId(String traceId) {
        this.traceId = traceId;
    }
}
