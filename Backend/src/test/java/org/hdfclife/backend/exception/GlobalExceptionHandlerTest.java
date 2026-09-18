package org.hdfclife.backend.exception;

import static org.junit.jupiter.api.Assertions.assertEquals;

import org.junit.jupiter.api.Test;
import org.springframework.http.ResponseEntity;

class GlobalExceptionHandlerTest {

    private final GlobalExceptionHandler handler =
            new GlobalExceptionHandler();

    @Test
    void shouldHandleInvalidCredentials() {

        InvalidCredentialException exception =
                new InvalidCredentialException(
                        "Invalid username or password"
                );

        ResponseEntity<?> response =
                handler.handleInvalidCredential(exception);

        assertEquals(401, response.getStatusCode().value());
    }



    @Test
    void shouldHandleInvalidAuthorization() {

        InvalidAuthorizationException exception =
                new InvalidAuthorizationException(
                        "Bearer token is required"
                );

        ResponseEntity<?> response =
                handler.handleInvalidAuthorization(exception);

        assertEquals(401, response.getStatusCode().value());
    }


    @Test
    void shouldHandleTokenExpired() {

        TokenExpiredException exception =
                new TokenExpiredException(
                        "Token expired"
                );

        ResponseEntity<?> response =
                handler.handleTokenExpired(exception);

        assertEquals(401, response.getStatusCode().value());
    }


    @Test
    void shouldHandleInvalidToken() {

        InvalidTokenException exception =
                new InvalidTokenException(
                        "Session is invalid or logged out"
                );

        ResponseEntity<?> response =
                handler.handleInvalidToken(exception);

        assertEquals(401, response.getStatusCode().value());
    }

    @Test
    void shouldHandleUsernameAlreadyExists() {

        UsernameAlreadyExistsException exception =
                new UsernameAlreadyExistsException(
                        "Username already exists"
                );

        ResponseEntity<?> response =
                handler.handleUsernameAlreadyExists(exception);

        assertEquals(409, response.getStatusCode().value());
    }

    @Test
    void shouldHandleUnexpectedException() {

        Exception exception =
                new Exception("Something went wrong");

        ResponseEntity<?> response =
                handler.handleUnexpectedException(exception);

        assertEquals(500, response.getStatusCode().value());
    }

    @Test
    void shouldHandleLoginRateLimitExceeded() {

        LoginRateLimitExceededException exception =
                new LoginRateLimitExceededException(
                        "Too many login attempts"
                );

        ResponseEntity<?> response =
                handler.handleLoginRateLimitExceeded(exception);

        assertEquals(429, response.getStatusCode().value());
    }

    @Test
    void shouldHandleLoginServiceUnavailable() {

        LoginServiceUnavailableException exception =
                new LoginServiceUnavailableException(
                        "Login service is temporarily unavailable"
                );

        ResponseEntity<?> response =
                handler.handleLoginServiceUnavailable(exception);

        assertEquals(503, response.getStatusCode().value());
    }
}
