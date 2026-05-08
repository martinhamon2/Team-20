package be.ucll.fs.project.exception;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);
    private static final Logger securityLog = LoggerFactory.getLogger("security");

    // Goes to app.log
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    @ExceptionHandler({RuntimeException.class})
    public Map<String, String> handleRuntimeException(RuntimeException ex) {
        if (ex instanceof SecurityException) throw ex;
        log.error("Application error: {}", ex.getMessage());
        Map<String, String> errors = new HashMap<>();
        errors.put("message", ex.getMessage());
        return errors;
    }

    // Goes to security.log
    @ResponseStatus(HttpStatus.UNAUTHORIZED)
    @ExceptionHandler({SecurityException.class})
    public Map<String, String> handleSecurityException(SecurityException ex) {
        securityLog.warn("Security event: {}", ex.getMessage());
        Map<String, String> errors = new HashMap<>();
        errors.put("message", ex.getMessage());
        return errors;
    }

    // Goes to app.log
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    @ExceptionHandler({MethodArgumentNotValidException.class})
    public Map<String, String> handleValidationExceptions(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();
        for (FieldError error : ex.getFieldErrors()) {
            errors.put(error.getField(), error.getDefaultMessage());
        }
        log.warn("Validation error: {}", errors);
        return errors;
    }
}