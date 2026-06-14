package com.example.demo.filter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class JwtFilter extends OncePerRequestFilter {

    @Autowired
    private JwtUtil jwtUtil;

    // This tells Spring Boot to skip the security check for Login, Signup, and Swagger
    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) throws ServletException {
        String path = request.getRequestURI();
        return path.startsWith("/api/auth/") || 
               path.startsWith("/swagger-ui/") || 
               path.startsWith("/v3/api-docs");
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
            
        // 1. Look for the "Authorization" header in the incoming request
        String authHeader = request.getHeader("Authorization");

        // 2. If it exists and has a token, extract it
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);

            // 3. Verify the token is real and hasn't expired
            if (jwtUtil.isValid(token)) {
                String role = jwtUtil.getRole(token);
                String email = jwtUtil.getEmail(token);

                // 4. Attach the user's role and email to the request so your Controllers can see it
                request.setAttribute("userRole", role);
                request.setAttribute("userEmail", email);
            }
        }

        // 5. Let the request continue to the Controller
        filterChain.doFilter(request, response);
    }
}