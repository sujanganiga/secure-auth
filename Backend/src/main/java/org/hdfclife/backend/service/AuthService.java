package org.hdfclife.backend.service;

import org.hdfclife.backend.dto.RegisterRequest;
import org.hdfclife.backend.entity.User;
import org.hdfclife.backend.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    public AuthService(UserRepository userRepository,PasswordEncoder passwordEncoder)
    {
        this.userRepository=userRepository;
        this.passwordEncoder=passwordEncoder;
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


}
