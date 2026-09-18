package org.hdfclife.backend.service;

import org.hdfclife.backend.dto.AuthResponse;
import org.hdfclife.backend.dto.LoginRequest;
import org.hdfclife.backend.dto.RegisterRequest;
import org.hdfclife.backend.entity.User;
import org.hdfclife.backend.exception.InvalidAuthorizationException;
import org.hdfclife.backend.exception.InvalidCredentialException;
import org.hdfclife.backend.exception.InvalidTokenException;
import org.hdfclife.backend.exception.UsernameAlreadyExistsException;
import org.hdfclife.backend.repository.UserRepository;
import org.hdfclife.backend.resilience.LoginCircuitBreakerService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.hdfclife.backend.dto.ExternalLoginRequest;
import org.hdfclife.backend.dto.ExternalLoginResponse;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final TokenStore tokenStore;
    private final LoginCircuitBreakerService loginCircuitBreakerService;
    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtService jwtService, TokenStore tokenStore, LoginCircuitBreakerService loginCircuitBreakerService)
    {
        this.userRepository=userRepository;
        this.passwordEncoder=passwordEncoder;
        this.jwtService=jwtService;
        this.tokenStore=tokenStore;
        this.loginCircuitBreakerService = loginCircuitBreakerService;
    }

    public void register(RegisterRequest request)
    {
        if(userRepository.existsByUsername(request.getUsername()))
        {
            throw new UsernameAlreadyExistsException("Username already exists");
        }
        String hashedPassword=passwordEncoder.encode(request.getPassword());
        User user=new User(request.getUsername(),hashedPassword);
        userRepository.save(user);
    }


    public AuthResponse login(LoginRequest request)
    {
        ExternalLoginRequest externalRequest =
                new ExternalLoginRequest(
                        request.getUsername(),
                        request.getPassword()
                );

        ExternalLoginResponse response = loginCircuitBreakerService.login(externalRequest);

        if(!response.isAuthenticated())
        {
            throw new InvalidCredentialException("Invalid username or password");
        }

        String token=jwtService.generateToken(response.getUsername());
        tokenStore.addToken(token);
        return new AuthResponse(token,response.getUsername(),"Login Successful");

    }

    public String authenticate(String token)
    {
        if(!tokenStore.containsToken(token))
        {
            throw new InvalidTokenException(
                    "Token is invalid"
            );
        }

        if(!jwtService.validateToken(token))
        {
            tokenStore.removeToken(token);

            throw new RuntimeException(
                    "Token expired or invalid"
            );
        }

        return jwtService.extractUsername(token);
    }

    public void logout(String token)
    {
        if(!tokenStore.containsToken(token))
        {
            throw new InvalidTokenException(
                    "Invalid or already logged out token"
            );
        }

        tokenStore.removeToken(token);
    }

}
