package com.example.demo.controller;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import com.example.demo.entity.Student;
import com.example.demo.entity.StudentMetrics;
import com.example.demo.entity.User;
import com.example.demo.filter.JwtUtil;
import com.example.demo.service.StudentService;
import jakarta.servlet.http.HttpServletRequest;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.enums.ParameterIn;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/student")
@SecurityRequirement(name = "BearerAuth")
public class StudentController {

    @Autowired private StudentService studentService;
    @Autowired private JwtUtil jwtUtil;

    private boolean isStudent(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) return false;
        String token = authHeader.substring(7);
        return jwtUtil.isValid(token) && "STUDENT".equals(jwtUtil.getRole(token));
    }

    @GetMapping("/profile")
    public ResponseEntity<?> getProfile(
            @Parameter(name = "Authorization", in = ParameterIn.HEADER, description = "Student JWT Token (Format: Bearer <token>)", required = true)
            HttpServletRequest request) {
        if (!isStudent(request)) return ResponseEntity.status(403).body("Access denied");
        String authHeader = request.getHeader("Authorization");
        String email = jwtUtil.getEmail(authHeader.substring(7));
        User user = studentService.getUserByEmail(email);
        if (user == null) return ResponseEntity.notFound().build();

        Student student = studentService.getStudentByUserId(user.getId());
        Map<String, Object> profile = new HashMap<>();
        profile.put("name", user.getName());
        profile.put("email", user.getEmail());
        profile.put("role", user.getRole());
        if (student != null) {
            profile.put("course", student.getCourse());
            profile.put("year", student.getYear());
            profile.put("studentId", student.getId());
        }
        return ResponseEntity.ok(profile);
    }

    @GetMapping("/marks")
    public ResponseEntity<?> getMarks(
            @Parameter(name = "Authorization", in = ParameterIn.HEADER, description = "Student JWT Token (Format: Bearer <token>)", required = true)
            HttpServletRequest request) {
        if (!isStudent(request)) return ResponseEntity.status(403).body("Access denied");
        String authHeader = request.getHeader("Authorization");
        String email = jwtUtil.getEmail(authHeader.substring(7));
        User user = studentService.getUserByEmail(email);
        if (user == null) return ResponseEntity.notFound().build();

        StudentMetrics m = studentService.getMetricsByUserId(user.getId());
        if (m == null) return ResponseEntity.notFound().build();

        Map<String, Object> res = new HashMap<>();
        res.put("marks", m.getMarks());
        res.put("studentId", m.getStudentId());
        return ResponseEntity.ok(res);
    }

    @GetMapping("/attendance")
    public ResponseEntity<?> getAttendance(
            @Parameter(name = "Authorization", in = ParameterIn.HEADER, description = "Student JWT Token (Format: Bearer <token>)", required = true)
            HttpServletRequest request) {
        if (!isStudent(request)) return ResponseEntity.status(403).body("Access denied");
        String authHeader = request.getHeader("Authorization");
        String email = jwtUtil.getEmail(authHeader.substring(7));
        User user = studentService.getUserByEmail(email);
        if (user == null) return ResponseEntity.notFound().build();

        StudentMetrics m = studentService.getMetricsByUserId(user.getId());
        if (m == null) return ResponseEntity.notFound().build();

        Map<String, Object> res = new HashMap<>();
        res.put("attendance", m.getAttendance() + "%");
        res.put("studentId", m.getStudentId());
        return ResponseEntity.ok(res);
    }
}