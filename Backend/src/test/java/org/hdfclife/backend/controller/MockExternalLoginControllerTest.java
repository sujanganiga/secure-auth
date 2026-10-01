package org.hdfclife.backend.controller;

import org.hdfclife.backend.dto.ExternalLoginRequest;
import org.hdfclife.backend.dto.ExternalLoginResponse;
import org.hdfclife.backend.entity.User;
import org.hdfclife.backend.exception.DatabaseServiceUnavailableException;
import org.hdfclife.backend.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.dao.DataAccessResourceFailureException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.transaction.CannotCreateTransactionException;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class MockExternalLoginControllerTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Test
    void authenticatesUserWithMatchingPassword() {
        MockExternalLoginController controller = controller();
        ExternalLoginRequest request = new ExternalLoginRequest("user@example.com", "password");
        when(userRepository.findByUsername(request.getUsername()))
                .thenReturn(Optional.of(new User(request.getUsername(), "encoded-password")));
        when(passwordEncoder.matches("password", "encoded-password")).thenReturn(true);

        ResponseEntity<ExternalLoginResponse> response = controller.login(request);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertTrue(response.getBody().isAuthenticated());
        assertEquals(request.getUsername(), response.getBody().getUsername());
    }

    @Test
    void rejectsUnknownUserAndIncorrectPassword() {
        MockExternalLoginController controller = controller();
        ExternalLoginRequest request = new ExternalLoginRequest("user@example.com", "password");
        when(userRepository.findByUsername(request.getUsername())).thenReturn(Optional.empty());

        ResponseEntity<ExternalLoginResponse> unknownUserResponse = controller.login(request);
        assertEquals(HttpStatus.UNAUTHORIZED, unknownUserResponse.getStatusCode());

        when(userRepository.findByUsername(request.getUsername()))
                .thenReturn(Optional.of(new User(request.getUsername(), "encoded-password")));
        when(passwordEncoder.matches("password", "encoded-password")).thenReturn(false);

        ResponseEntity<ExternalLoginResponse> incorrectPasswordResponse = controller.login(request);
        assertEquals(HttpStatus.UNAUTHORIZED, incorrectPasswordResponse.getStatusCode());
    }

    @Test
    void returnsServerErrorWhenMockFailureIsEnabled() {
        MockExternalLoginController controller = controller();
        ReflectionTestUtils.setField(controller, "failure", true);

        ResponseEntity<ExternalLoginResponse> response = controller.login(
                new ExternalLoginRequest("user@example.com", "password"));

        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
        verifyNoInteractions(userRepository, passwordEncoder);
    }

    @Test
    void mapsDatabaseAndTransactionFailuresToDatabaseUnavailable() {
        MockExternalLoginController controller = controller();
        ExternalLoginRequest request = new ExternalLoginRequest("user@example.com", "password");
        when(userRepository.findByUsername(request.getUsername()))
            .thenThrow(
                new DataAccessResourceFailureException("database unavailable"),
                new CannotCreateTransactionException("transaction unavailable"));

        assertThrows(DatabaseServiceUnavailableException.class, () -> controller.login(request));
        assertThrows(DatabaseServiceUnavailableException.class, () -> controller.login(request));
    }

    private MockExternalLoginController controller() {
        return new MockExternalLoginController(userRepository, passwordEncoder);
    }
}