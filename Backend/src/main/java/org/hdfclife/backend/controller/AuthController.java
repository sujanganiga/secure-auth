package org.hdfclife.backend.controller;

import org.hdfclife.backend.dto.RegisterRequest;
import org.hdfclife.backend.entity.User;
import org.hdfclife.backend.service.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController

public class AuthController {

    private final AuthService authService;
    public AuthController(AuthService authService)
    {
        this.authService=authService;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request)
    {
        authService.register(request);
        return ResponseEntity.ok(
                Map.of("message","Registration Successfull")
        );
    }

}
