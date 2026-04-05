package logistic_service.com.dto;

public record ApiErrorEnvelope(
        boolean success,
        boolean showWarning,
        String warningMessage,
        ApiErrorResponse error
) {
    public static ApiErrorEnvelope of(ApiErrorResponse error) {
        return new ApiErrorEnvelope(false, true, error.message(), error);
    }
}
