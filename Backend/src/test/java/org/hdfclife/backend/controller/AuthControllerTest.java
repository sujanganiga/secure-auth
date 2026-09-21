package org.hdfclife.backend.controller;

import org.hdfclife.backend.exception.GlobalExceptionHandler;
import org.hdfclife.backend.exception.InvalidCredentialException;
import org.hdfclife.backend.exception.LoginRateLimitExceededException;
import org.hdfclife.backend.exception.UsernameAlreadyExistsException;
import org.hdfclife.backend.service.AuthService;
import org.hdfclife.backend.resilience.LoginRateLimiterService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;

import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import org.hdfclife.backend.dto.RegisterRequest;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.springframework.http.MediaType;

import org.hdfclife.backend.dto.AuthResponse;
import org.hdfclife.backend.dto.LoginRequest;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.never;

@ExtendWith(MockitoExtension.class)
class AuthControllerTest {

    private MockMvc mockMvc;

    @Mock
    private AuthService authService;

    @Mock
    private LoginRateLimiterService loginRateLimiterService;

    @BeforeEach
    void setUp() {

        AuthController authController =
                new AuthController(
                        authService,
                        loginRateLimiterService
                );

        mockMvc = MockMvcBuilders
                .standaloneSetup(authController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
    }

    @Test
    void shouldRegisterUserSuccessfully() throws Exception {

        RegisterRequest request =
                new RegisterRequest("testuser", "testpassword");

        mockMvc.perform(
                        post("/register")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content("""
                            {
                                "username": "testuser",
                                "password": "testpassword"
                            }
                            """)
                )
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message")
                        .value("Registration Successfull"));

        verify(authService).register(any(RegisterRequest.class));
    }


    @Test
    void shouldLoginSuccessfully() throws Exception {

        AuthResponse authResponse =
                new AuthResponse(
                        "test-jwt-token",
                        "test-refresh-token",
                        "testuser",
                        "Login Successful"
                );

        when(authService.login(any(LoginRequest.class)))
                .thenReturn(authResponse);

        mockMvc.perform(
                        post("/login")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content("""
                            {
                                "username": "testuser",
                                "password": "testpassword"
                            }
                            """)
                )
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token")
                        .value("test-jwt-token"))
                .andExpect(jsonPath("$.username")
                        .value("testuser"));

        verify(loginRateLimiterService)
                .checkLoginAttempt(anyString(), anyString());

        verify(authService)
                .login(any(LoginRequest.class));
    }

    @Test
    void shouldRejectDuplicateUsername() throws Exception {

        doThrow(new UsernameAlreadyExistsException("Username already exists"))
                .when(authService)
                .register(any(RegisterRequest.class));

        mockMvc.perform(
                        post("/register")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content("""
                            {
                                "username": "testuser",
                                "password": "testpassword"
                            }
                            """)
                )
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.error")
                        .value("USERNAME_ALREADY_EXISTS"));
    }

    @Test
    void shouldRejectInvalidCredentials() throws Exception {

        when(authService.login(any(LoginRequest.class)))
                .thenThrow(new InvalidCredentialException(
                        "Invalid username or password"
                ));

        mockMvc.perform(
                        post("/login")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content("""
                            {
                                "username": "testuser",
                                "password": "wrongpassword"
                            }
                            """)
                )
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.error")
                        .value("INVALID_CREDENTIALS"));
    }

    @Test
    void shouldRejectLoginWhenRateLimitExceeded() throws Exception {

        doThrow(new LoginRateLimitExceededException(
                "Too many login attempts"
        ))
                .when(loginRateLimiterService)
                .checkLoginAttempt(anyString(), anyString());

        mockMvc.perform(
                        post("/login")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content("""
                            {
                                "username": "testuser",
                                "password": "testpassword"
                            }
                            """)
                )
                .andExpect(status().isTooManyRequests())
                .andExpect(jsonPath("$.error")
                        .value("LOGIN_RATE_LIMIT_EXCEEDED"));

        verify(authService, never())
                .login(any(LoginRequest.class));
    }

    @Test
    void shouldRejectAuthWithoutAuthorizationHeader() throws Exception {

        mockMvc.perform(
                        get("/auth")
                )
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.Message")
                        .value("Bearer token is required"));
    }

    @Test
    void shouldAuthenticateValidToken() throws Exception {

        when(authService.authenticate("valid-token"))
                .thenReturn("testuser");

        mockMvc.perform(
                        get("/auth")
                                .header("Authorization", "Bearer valid-token")
                )
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.username")
                        .value("testuser"))
                .andExpect(jsonPath("$.authenticated")
                        .value(true));

        verify(authService)
                .authenticate("valid-token");
    }

    @Test
    void shouldLogoutSuccessfully() throws Exception {

        doNothing()
                .when(authService)
                .logout("valid-token", "valid-refresh-token");

        mockMvc.perform(
                        post("/logout")
                                .header("Authorization", "Bearer valid-token")
                                .header(
                                        "Refresh-Token",
                                        "valid-refresh-token"
                                )
                )
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message")
                        .value("Logout successful"));

        verify(authService)
                .logout("valid-token", "valid-refresh-token");
    }
    @Test
    void shouldRejectLogoutWithoutAuthorizationHeader() throws Exception {

        mockMvc.perform(
                        post("/logout")
                )
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.error")
                        .value("INVALID_AUTHORIZATION"));
    }
}
