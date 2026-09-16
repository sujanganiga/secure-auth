package org.hdfclife.backend.service;

import org.hdfclife.backend.dto.AuthResponse;
import org.hdfclife.backend.dto.LoginRequest;
import org.hdfclife.backend.dto.RegisterRequest;
import org.hdfclife.backend.entity.User;
import org.hdfclife.backend.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final TokenStore tokenStore;
    public AuthService(UserRepository userRepository,PasswordEncoder passwordEncoder,JwtService jwtService,TokenStore tokenStore)
    {
        this.userRepository=userRepository;
        this.passwordEncoder=passwordEncoder;
        this.jwtService=jwtService;
        this.tokenStore=tokenStore;
    }

    public void register(RegisterRequest request)
    {
        if(userRepository.existsByUsername(request.getUsername()))
        {
            throw new RuntimeException("Username already exists");
        }
        String hashedPassword=passwordEncoder.encode(request.getPassword());
        User user=new User(request.getUsername(),hashedPassword);
        userRepository.save(user);
    }


    public AuthResponse login(LoginRequest request)
    {
        User user=userRepository.findByUsername(request.getUsername())
                .orElseThrow(()->new RuntimeException("Invalid username or password"));

        boolean passwordMatches=passwordEncoder.matches(request.getPassword(),user.getPassword());

        if(!passwordMatches)
        {
            throw new RuntimeException("Invalid username or password");
        }

        String token=jwtService.generateToken(user.getUsername());
        tokenStore.addToken(token);
        return new AuthResponse(token,user.getUsername(),"Login Successful");

    }

}
