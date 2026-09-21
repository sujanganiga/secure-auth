package org.hdfclife.backend.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.hdfclife.backend.dto.ExternalLoginRequest;
import org.hdfclife.backend.dto.ExternalLoginResponse;
import org.hdfclife.backend.entity.User;
import org.hdfclife.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/mock")
@Tag(
        name = "Mock External Login",
        description = "Mock external authentication service used for resilience and circuit breaker testing"
)
public class MockExternalLoginController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${mock.login.failure:false}")
    private boolean failure;

    public MockExternalLoginController(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder) {

        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Operation(
            summary = "Mock external login",
            description = "Simulates an external login service. The service can be configured to fail using mock.login.failure=true."
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "External login successful"
            ),
            @ApiResponse(
                    responseCode = "401",
                    description = "Invalid credentials"
            ),
            @ApiResponse(
                    responseCode = "500",
                    description = "Mock external service failure"
            )
    })
    @PostMapping("/external-login")
    public ResponseEntity<ExternalLoginResponse> login(
            @RequestBody ExternalLoginRequest request) {

        if (failure) {
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .build();
        }

        User user = userRepository
                .findByUsername(request.getUsername())
                .orElse(null);

        if (user == null ||
                !passwordEncoder.matches(
                        request.getPassword(),
                        user.getPassword())) {

            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .build();
        }

        return ResponseEntity.ok(
                new ExternalLoginResponse(
                        true,
                        user.getUsername()
                )
        );
    }
}