package com.example.demo.controller;

import com.example.demo.dto.LoginRequest;
import com.example.demo.entity.User;
import com.example.demo.filter.JwtUtil;
import com.example.demo.repository.UserRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@Tag(name = "Authentication API", description = "Endpoints for user registration and login")
public class AuthController {

    @Autowired private UserRepository userRepo;
    @Autowired private JwtUtil jwtUtil;

    @PostMapping("/signup")
    @Operation(summary = "Register a new user", description = "Creates a new user account in the database.")
    public ResponseEntity<?> signup(@RequestBody User user) {
        if (userRepo.findByEmail(user.getEmail()) != null) {
            return ResponseEntity.badRequest().body("Email already registered");
        }
        userRepo.save(user);
        
        // Safe role check for signup response
        String roleName = (user.getRole() != null) ? user.getRole().name() : "USER";
        
        Map<String, String> res = new HashMap<>();
        res.put("message", "Signup successful");
        res.put("role", roleName);
        return ResponseEntity.ok(res);
    }

    @PostMapping("/signin")
    @Operation(summary = "Login user", description = "Authenticates a user and returns a JWT token.")
    public ResponseEntity<?> signin(@RequestBody LoginRequest req) {
        User user = userRepo.findByEmail(req.getEmail());
        
        // 1. Bulletproof password check (prevents NullPointerException)
        if (user == null || req.getPassword() == null || !req.getPassword().equals(user.getPassword())) {
            return ResponseEntity.status(401).body("Invalid email or password");
        }
        
        // 2. Bulletproof role check (defaults to "USER" if role is missing in DB)
        String roleName = (user.getRole() != null) ? user.getRole().name() : "USER";
        
        // 3. Generate token
        String token = jwtUtil.generateToken(user.getEmail(), roleName);
        
        Map<String, Object> res = new HashMap<>();
        res.put("token", token);
        res.put("role", roleName);
        res.put("name", user.getName());
        res.put("email", user.getEmail());
        
        return ResponseEntity.ok(res);
    }
}