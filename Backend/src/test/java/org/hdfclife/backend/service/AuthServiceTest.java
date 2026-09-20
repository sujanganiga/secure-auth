package org.hdfclife.backend.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.*;

import org.hdfclife.backend.dto.*;
import org.hdfclife.backend.entity.User;
import org.hdfclife.backend.exception.InvalidCredentialException;
import org.hdfclife.backend.exception.InvalidTokenException;
import org.hdfclife.backend.exception.UsernameAlreadyExistsException;
import org.hdfclife.backend.repository.RefreshTokenStore;
import org.hdfclife.backend.repository.TokenStore;
import org.hdfclife.backend.repository.UserRepository;
import org.hdfclife.backend.resilience.LoginCircuitBreakerService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtService jwtService;

    @Mock
    private TokenStore tokenStore;

    @Mock
    private RefreshTokenStore refreshTokenStore;

    @Mock
    private LoginCircuitBreakerService loginCircuitBreakerService;

    @InjectMocks
    private AuthService authService;


    @Test
    void shouldRegisterUserSuccessfully() {

        RegisterRequest request =
                new RegisterRequest("vanitha", "password123");

        when(userRepository.existsByUsername("vanitha"))
                .thenReturn(false);

        when(passwordEncoder.encode("password123"))
                .thenReturn("hashedPassword");

        authService.register(request);

        verify(userRepository).save(any(User.class));
    }


    @Test
    void shouldRejectDuplicateUsername() {

        RegisterRequest request =
                new RegisterRequest("vanitha", "password123");

        when(userRepository.existsByUsername("vanitha"))
                .thenReturn(true);

        assertThrows(
                UsernameAlreadyExistsException.class,
                () -> authService.register(request)
        );

        verify(userRepository, never()).save(any(User.class));
    }


    @Test
    void shouldLoginSuccessfully() {

        LoginRequest request =
                new LoginRequest("vanitha", "password123");

        ExternalLoginResponse externalResponse =
                new ExternalLoginResponse(
                        true,
                        "vanitha"
                );

        when(loginCircuitBreakerService.login(any(ExternalLoginRequest.class)))
                .thenReturn(externalResponse);

        when(jwtService.generateToken("vanitha"))
                .thenReturn("test-jwt-token");

        AuthResponse response =
                authService.login(request);

        assertEquals("vanitha", response.getUsername());
        assertEquals("test-jwt-token", response.getToken());

        verify(tokenStore).addToken("test-jwt-token");
    }


    @Test
    void shouldRejectInvalidCredentials() {

        LoginRequest request =
                new LoginRequest("vanitha", "wrongpassword");

        ExternalLoginResponse externalResponse =
                new ExternalLoginResponse(
                        false,
                        "vanitha"
                );

        when(loginCircuitBreakerService.login(any(ExternalLoginRequest.class)))
                .thenReturn(externalResponse);

        assertThrows(
                InvalidCredentialException.class,
                () -> authService.login(request)
        );

        verify(jwtService, never()).generateToken(anyString());
        verify(tokenStore, never()).addToken(anyString());
    }


    @Test
    void shouldAuthenticateValidToken() {

        String token = "valid-token";

        when(tokenStore.containsToken(token))
                .thenReturn(true);

        when(jwtService.validateToken(token))
                .thenReturn(true);

        when(jwtService.extractUsername(token))
                .thenReturn("vanitha");

        String username =
                authService.authenticate(token);

        assertEquals("vanitha", username);
    }


    @Test
    void shouldRejectInvalidToken() {

        String token = "invalid-token";

        when(tokenStore.containsToken(token))
                .thenReturn(false);

        assertThrows(
                InvalidTokenException.class,
                () -> authService.authenticate(token)
        );
    }


    @Test
    void shouldLogoutSuccessfully() {

        String token = "valid-token";
        String refreshToken="refresh-token";

        when(tokenStore.containsToken(token))
                .thenReturn(true);
        when(refreshTokenStore.containsToken(refreshToken))
                .thenReturn(true);

        authService.logout(token,refreshToken);

        verify(tokenStore).removeToken(token);
        verify(refreshTokenStore)
                .removeToken(refreshToken);
    }


    @Test
    void shouldRejectAlreadyLoggedOutToken() {

        String token = "already-logged-out-token";
        String refreshToken = "refresh-token";

        when(tokenStore.containsToken(token))
                .thenReturn(false);

        assertThrows(
                InvalidTokenException.class,
                () -> authService.logout(token,refreshToken)
        );
    }
}