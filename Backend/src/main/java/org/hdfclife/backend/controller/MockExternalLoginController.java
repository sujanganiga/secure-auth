package org.hdfclife.backend.controller;

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