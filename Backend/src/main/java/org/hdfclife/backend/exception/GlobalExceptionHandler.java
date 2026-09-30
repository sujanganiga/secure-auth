package org.hdfclife.backend.exception;

import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataAccessException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.TransactionException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger logger =
            LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(InvalidCredentialException.class)
    public ResponseEntity<?> handleInvalidCredential(
            InvalidCredentialException ex) {

        return ResponseEntity
                .status(HttpStatus.UNAUTHORIZED)
                .body(Map.of(
                        "error", "INVALID_CREDENTIALS",
                        "message", ex.getMessage(),
                        "status", 401
                ));
    }

    @ExceptionHandler(InvalidAuthorizationException.class)
    public ResponseEntity<?> handleInvalidAuthorization(
            InvalidAuthorizationException ex) {

        return ResponseEntity
                .status(HttpStatus.UNAUTHORIZED)
                .body(Map.of(
                        "error", "INVALID_AUTHORIZATION",
                        "message", ex.getMessage(),
                        "status", 401
                ));
    }

    @ExceptionHandler(TokenExpiredException.class)
    public ResponseEntity<?> handleTokenExpired(
            TokenExpiredException ex) {

        return ResponseEntity
                .status(HttpStatus.UNAUTHORIZED)
                .body(Map.of(
                        "error", "TOKEN_EXPIRED",
                        "message", ex.getMessage(),
                        "status", 401
                ));
    }

    @ExceptionHandler(InvalidTokenException.class)
    public ResponseEntity<?> handleInvalidToken(
            InvalidTokenException ex) {

        return ResponseEntity
                .status(HttpStatus.UNAUTHORIZED)
                .body(Map.of(
                        "error", "INVALID_TOKEN",
                        "message", ex.getMessage(),
                        "status", 401
                ));
    }

    @ExceptionHandler(UsernameAlreadyExistsException.class)
    public ResponseEntity<?> handleUsernameAlreadyExists(
            UsernameAlreadyExistsException ex) {

        return ResponseEntity
                .status(HttpStatus.CONFLICT)
                .body(Map.of(
                        "error", "USERNAME_ALREADY_EXISTS",
                        "message", ex.getMessage(),
                        "status", 409
                ));
    }

    @ExceptionHandler(LoginRateLimitExceededException.class)
    public ResponseEntity<?> handleLoginRateLimitExceeded(
            LoginRateLimitExceededException ex) {

        return ResponseEntity
                .status(HttpStatus.TOO_MANY_REQUESTS)
                .body(Map.of(
                        "error", "LOGIN_RATE_LIMIT_EXCEEDED",
                        "message", ex.getMessage(),
                        "status", 429
                ));
    }


    @ExceptionHandler(LoginServiceUnavailableException.class)
    public ResponseEntity<?> handleLoginServiceUnavailable(
            LoginServiceUnavailableException ex) {

        return ResponseEntity
                .status(HttpStatus.SERVICE_UNAVAILABLE)
                .body(Map.of(
                        "error", "LOGIN_SERVICE_UNAVAILABLE",
                        "message", ex.getMessage(),
                        "status", 503
                ));
    }

    @ExceptionHandler(DatabaseServiceUnavailableException.class)
    public ResponseEntity<?> handleDatabaseServiceUnavailable(
            DatabaseServiceUnavailableException ex) {

        return ResponseEntity
                .status(HttpStatus.SERVICE_UNAVAILABLE)
                .body(Map.of(
                        "error", "DATABASE_SERVICE_UNAVAILABLE",
                        "message", ex.getMessage(),
                        "status", 503
                ));
    }

    /**
     * Safety net for DB failures that bypass DatabaseCircuitBreakerService
     * (e.g. MockExternalLoginController calling UserRepository directly).
     */
    @ExceptionHandler({DataAccessException.class, TransactionException.class})
    public ResponseEntity<?> handleDatabaseAccessFailure(Exception ex) {

        logger.error("Database access failure while processing request", ex);

        return ResponseEntity
                .status(HttpStatus.SERVICE_UNAVAILABLE)
                .body(Map.of(
                        "error", "DATABASE_SERVICE_UNAVAILABLE",
                        "message", "Database service is temporarily unavailable",
                        "status", 503
                ));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<?> handleValidation(
            MethodArgumentNotValidException ex) {

        String message = ex.getBindingResult()
                .getFieldErrors()
                .stream()
                .findFirst()
                .map(error -> error.getDefaultMessage())
                .orElse("Validation failed");

        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(Map.of(
                        "error", "VALIDATION_FAILED",
                        "message", message,
                        "status", 400
                ));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<?> handleUnexpectedException(
            Exception ex) {

        logger.error(
                "Unhandled exception while processing request: {}",
                ex.getClass().getName(),
                ex
        );

        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of(
                        "error", "INTERNAL_SERVER_ERROR",
                        "message", "An unexpected error occurred",
                        "status", 500
                ));
    }


}
