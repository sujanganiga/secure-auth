package org.hdfclife.backend.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import org.hdfclife.backend.dto.AuthResponse;
import org.hdfclife.backend.dto.LoginRequest;
import org.hdfclife.backend.dto.RefreshRequest;
import org.hdfclife.backend.dto.RegisterRequest;
import org.hdfclife.backend.exception.InvalidAuthorizationException;
import org.hdfclife.backend.resilience.LoginRateLimiterService;
import org.hdfclife.backend.service.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@Tag(
        name = "Authentication",
        description = "Authentication, registration, JWT and token management APIs"
)
public class AuthController {

    private final AuthService authService;
    private final LoginRateLimiterService loginRateLimiterService;

    public AuthController(
            AuthService authService,
            LoginRateLimiterService loginRateLimiterService) {

        this.authService = authService;
        this.loginRateLimiterService = loginRateLimiterService;
    }

    @Operation(
            summary = "Register a new user",
            description = "Creates a new user account."
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Registration successful"
            ),
            @ApiResponse(
                    responseCode = "409",
                    description = "Username already exists"
            )
    })
    @PostMapping("/register")
    public ResponseEntity<?> register(
            @RequestBody RegisterRequest request) {

        authService.register(request);

        return ResponseEntity.ok(
                Map.of("message", "Registration Successfull")
        );
    }

    @Operation(
            summary = "Login",
            description = "Authenticates the user and returns JWT access and refresh tokens. Login attempts are rate limited by username and IP address."
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Login successful"
            ),
            @ApiResponse(
                    responseCode = "401",
                    description = "Invalid credentials"
            ),
            @ApiResponse(
                    responseCode = "429",
                    description = "Too many login attempts"
            ),
            @ApiResponse(
                    responseCode = "503",
                    description = "Login service temporarily unavailable"
            )
    })
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(
            @RequestBody LoginRequest loginRequest,
            HttpServletRequest request) {

        String username = loginRequest.getUsername();
        String ipAddress = request.getRemoteAddr();

        loginRateLimiterService.checkLoginAttempt(
                username,
                ipAddress
        );

        return ResponseEntity.ok(
                authService.login(loginRequest)
        );
    }

    @Operation(
            summary = "Validate JWT token",
            description = "Validates the Bearer JWT and returns the authenticated username.",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Token is valid"
            ),
            @ApiResponse(
                    responseCode = "401",
                    description = "Bearer token is missing or invalid"
            )
    })
    @GetMapping("/auth")
    public ResponseEntity<?> auth(
            @RequestHeader(
                    value = "Authorization",
                    required = false
            ) String authorization) {

        if (authorization == null ||
                !authorization.startsWith("Bearer ")) {

            return ResponseEntity
                    .status(401)
                    .body(
                            Map.of(
                                    "Message",
                                    "Bearer token is required"
                            )
                    );
        }

        String token = authorization.substring(7);

        String username = authService.authenticate(token);

        return ResponseEntity.ok(
                Map.of(
                        "username", username,
                        "authenticated", true
                )
        );
    }

    @Operation(
            summary = "Logout",
            description = "Logs out the user using the access token and refresh token.",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Logout successful"
            ),
            @ApiResponse(
                    responseCode = "401",
                    description = "Authorization token or refresh token is missing"
            )
    })
    @PostMapping("/logout")
    public ResponseEntity<?> logout(
            @RequestHeader(
                    value = "Authorization",
                    required = false
            ) String authorization,

            @RequestHeader(
                    value = "Refresh-Token",
                    required = false
            ) String refreshToken) {

        if (authorization == null ||
                !authorization.startsWith("Bearer ")) {

            throw new InvalidAuthorizationException(
                    "Bearer token is required"
            );
        }

        if (refreshToken == null ||
                refreshToken.isBlank()) {

            throw new InvalidAuthorizationException(
                    "Refresh token is required"
            );
        }

        String token = authorization.substring(7);

        authService.logout(
                token,
                refreshToken
        );

        return ResponseEntity.ok(
                Map.of(
                        "message",
                        "Logout successful"
                )
        );
    }

    @Operation(
            summary = "Refresh access token",
            description = "Generates a new access token using the refresh token."
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Access token refreshed successfully"
            ),
            @ApiResponse(
                    responseCode = "401",
                    description = "Invalid or expired refresh token"
            )
    })
    @PostMapping("/refresh")
    public ResponseEntity<AuthResponse> refresh(
            @RequestBody RefreshRequest refreshRequest) {

        return ResponseEntity.ok(
                authService.refreshToken(
                        refreshRequest.getRefreshToken()
                )
        );
    }
}