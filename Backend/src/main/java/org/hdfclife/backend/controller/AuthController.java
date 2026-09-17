package org.hdfclife.backend.controller;

import org.hdfclife.backend.dto.AuthResponse;
import org.hdfclife.backend.dto.LoginRequest;
import org.hdfclife.backend.dto.RegisterRequest;
import org.hdfclife.backend.entity.User;
import org.hdfclife.backend.service.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.servlet.http.HttpServletRequest;
import org.hdfclife.backend.resilience.LoginRateLimiterService;

import java.util.Map;

@RestController

public class AuthController {

    private final AuthService authService;
    private final LoginRateLimiterService loginRateLimiterService;
    public AuthController(AuthService authService, LoginRateLimiterService loginRateLimiterService)
    {
        this.authService=authService;
        this.loginRateLimiterService = loginRateLimiterService;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request)
    {
        authService.register(request);
        return ResponseEntity.ok(
                Map.of("message","Registration Successfull")
        );
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest loginRequest, HttpServletRequest request) {

        String username = loginRequest.getUsername();
        String ipAddress = request.getRemoteAddr();

        loginRateLimiterService.checkLoginAttempt(username,ipAddress);

        return ResponseEntity.ok(authService.login(loginRequest));
    }

    @GetMapping("/auth")
    public ResponseEntity<?> auth(@RequestHeader(value = "Authorization",required = false) String authorization)
    {
        if(authorization==null || !authorization.startsWith("Bearer "))
        {
            return ResponseEntity
                    .status(401)
                    .body(
                            Map.of("Message","Bearer token is required")
                    );
        }

        String token=authorization.substring(7);
        String username=authService.authenticate(token);
        return ResponseEntity.ok(
                Map.of(
                        "username", username,
                        "authenticated", true
                )
        );
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(@RequestHeader(value = "Authorization",required = false) String authorization)
    {
        if (authorization == null ||
                !authorization.startsWith("Bearer ")) {

            return ResponseEntity
                    .status(401)
                    .body(
                            Map.of(
                                    "message",
                                    "Bearer token is required"
                            )
                    );
        }

        String token = authorization.substring(7);

        authService.logout(token);

        return ResponseEntity.ok(
            Map.of(
                    "message",
                    "Logout successful"
            )
    );
    }

}
