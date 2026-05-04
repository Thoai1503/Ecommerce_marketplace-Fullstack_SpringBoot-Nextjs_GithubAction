package docker_test.com.controllers;

import java.util.UUID;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

import docker_test.com.dto.ApiError;
import jakarta.servlet.http.HttpServletRequest;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiError> handleValidation(
            MethodArgumentNotValidException ex,
            HttpServletRequest request) {
        ApiError err = new ApiError(
                HttpStatus.BAD_REQUEST.value(),
                "VALIDATION_FAILED",
                "Dữ liệu không hợp lệ. Vui lòng kiểm tra các trường bị đánh dấu.",
                request.getRequestURI()
        );

        for (FieldError fieldError : ex.getBindingResult().getFieldErrors()) {
            err.addFieldError(
                    fieldError.getField(),
                    fieldError.getDefaultMessage() != null
                            ? fieldError.getDefaultMessage()
                            : "Giá trị không hợp lệ"
            );
        }

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(err);
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ApiError> handleMalformedJson(
            HttpMessageNotReadableException ex,
            HttpServletRequest request) {
        ApiError err = new ApiError(
                HttpStatus.BAD_REQUEST.value(),
                "MALFORMED_JSON",
                "Dữ liệu gửi lên không đúng định dạng JSON.",
                request.getRequestURI()
        );
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(err);
    }

    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<ApiError> handleTypeMismatch(
            MethodArgumentTypeMismatchException ex,
            HttpServletRequest request) {
        ApiError err = new ApiError(
                HttpStatus.BAD_REQUEST.value(),
                "TYPE_MISMATCH",
                "Tham số '" + ex.getName() + "' có kiểu không hợp lệ.",
                request.getRequestURI()
        );
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(err);
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ApiError> handleDataIntegrity(
            DataIntegrityViolationException ex,
            HttpServletRequest request) {
        String rootMessage = mostSpecificMessage(ex);
        String lower = rootMessage.toLowerCase();

        HttpStatus status = HttpStatus.CONFLICT;
        String errorCode;
        String userMessage;

        if (lower.contains("uq_product_shop_slug")) {
            errorCode = "DUPLICATE_PRODUCT_SLUG";
            userMessage = "Sản phẩm với slug này đã tồn tại trong shop.";
        } else if (lower.contains("uq_shop_tax_code")) {
            errorCode = "DUPLICATE_TAX_CODE";
            userMessage = "Mã số thuế đã được đăng ký.";
        } else if (lower.contains("uq_shop_business_license")) {
            errorCode = "DUPLICATE_BUSINESS_LICENSE";
            userMessage = "Giấy phép kinh doanh đã đăng ký.";
        } else if (lower.contains("fk_product_category")) {
            status = HttpStatus.BAD_REQUEST;
            errorCode = "INVALID_CATEGORY";
            userMessage = "Danh mục không tồn tại hoặc đã bị xóa.";
        } else if (lower.contains("fk_product_shop")) {
            status = HttpStatus.BAD_REQUEST;
            errorCode = "INVALID_SHOP";
            userMessage = "Shop không tồn tại hoặc đã bị xóa.";
        } else if (lower.contains("chk_product_price_positive")) {
            status = HttpStatus.BAD_REQUEST;
            errorCode = "INVALID_PRICE";
            userMessage = "Giá bán phải lớn hơn 0.";
        } else if (lower.contains("chk_product_stock_non_negative")) {
            status = HttpStatus.BAD_REQUEST;
            errorCode = "INVALID_STOCK";
            userMessage = "Tồn kho không được âm.";
        } else if (lower.contains("chk_product_original_price_valid")) {
            status = HttpStatus.BAD_REQUEST;
            errorCode = "INVALID_ORIGINAL_PRICE";
            userMessage = "Giá gốc phải >= giá bán.";
        } else if (lower.contains("duplicate")) {
            errorCode = "DUPLICATE_KEY";
            userMessage = "Dữ liệu đã tồn tại.";
        } else if (lower.contains("foreign key")) {
            status = HttpStatus.BAD_REQUEST;
            errorCode = "FK_VIOLATION";
            userMessage = "Dữ liệu tham chiếu không hợp lệ.";
        } else if (lower.contains("check constraint")) {
            status = HttpStatus.BAD_REQUEST;
            errorCode = "CHECK_VIOLATION";
            userMessage = "Dữ liệu vi phạm ràng buộc.";
        } else {
            errorCode = "DATA_INTEGRITY_ERROR";
            userMessage = "Không thể lưu dữ liệu do vi phạm ràng buộc.";
        }

        return ResponseEntity.status(status)
                .body(new ApiError(status.value(), errorCode, userMessage, request.getRequestURI()));
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ApiError> handleIllegalArgument(
            IllegalArgumentException ex,
            HttpServletRequest request) {
        ApiError err = new ApiError(
                HttpStatus.BAD_REQUEST.value(),
                "ILLEGAL_ARGUMENT",
                ex.getMessage() != null ? ex.getMessage() : "Tham số không hợp lệ.",
                request.getRequestURI()
        );
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(err);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiError> handleGeneric(Exception ex, HttpServletRequest request) {
        String traceId = UUID.randomUUID().toString();
        System.err.println("[ERROR] traceId=" + traceId + " path=" + request.getRequestURI());
        ex.printStackTrace();

        ApiError err = new ApiError(
                HttpStatus.INTERNAL_SERVER_ERROR.value(),
                "INTERNAL_ERROR",
                "Lỗi hệ thống. Vui lòng thử lại sau hoặc liên hệ admin với mã: " + traceId,
                request.getRequestURI()
        );
        err.setTraceId(traceId);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(err);
    }

    private String mostSpecificMessage(Throwable throwable) {
        Throwable current = throwable;
        while (current.getCause() != null && current.getCause() != current) {
            current = current.getCause();
        }
        return current.getMessage() != null ? current.getMessage() : "";
    }
}
