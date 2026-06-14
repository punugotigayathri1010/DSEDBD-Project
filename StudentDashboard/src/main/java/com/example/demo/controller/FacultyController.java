package com.example.demo.controller;

import com.example.demo.dto.AddStudentRequest;
import com.example.demo.dto.UpdateMetricsRequest;
import com.example.demo.entity.Student;
import com.example.demo.entity.StudentMetrics;
import com.example.demo.filter.JwtUtil;
import com.example.demo.service.StudentService;
import jakarta.servlet.http.HttpServletRequest;

// This single import replaces all the @Parameter imports
import io.swagger.v3.oas.annotations.security.SecurityRequirement; 

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/faculty")
@SecurityRequirement(name = "BearerAuth") // Tells Swagger to use the Green Authorize Button
public class FacultyController {

    @Autowired private StudentService studentService;
    @Autowired private JwtUtil jwtUtil;

    private boolean isFaculty(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) return false;
        String token = authHeader.substring(7);
        return jwtUtil.isValid(token) && "FACULTY".equals(jwtUtil.getRole(token));
    }

    @PostMapping("/add-student")
    public ResponseEntity<?> addStudent(HttpServletRequest request, @RequestBody AddStudentRequest req) {
        if (!isFaculty(request)) return ResponseEntity.status(403).body("Access denied");
        return ResponseEntity.ok(studentService.addStudent(req));
    }

    @DeleteMapping("/delete-student/{id}")
    public ResponseEntity<?> deleteStudent(HttpServletRequest request, @PathVariable Long id) {
        if (!isFaculty(request)) return ResponseEntity.status(403).body("Access denied");
        return ResponseEntity.ok(studentService.deleteStudent(id));
    }

    @PutMapping("/update-metrics")
    public ResponseEntity<?> updateMetrics(HttpServletRequest request, @RequestBody UpdateMetricsRequest req) {
        if (!isFaculty(request)) return ResponseEntity.status(403).body("Access denied");
        return ResponseEntity.ok(studentService.updateMetrics(req));
    }

    @GetMapping("/all-students")
    public ResponseEntity<?> getAllStudents(HttpServletRequest request) {
        if (!isFaculty(request)) return ResponseEntity.status(403).body("Access denied");
        return ResponseEntity.ok(studentService.getAllStudents());
    }

    @GetMapping("/all-metrics")
    public ResponseEntity<?> getAllMetrics(HttpServletRequest request) {
        if (!isFaculty(request)) return ResponseEntity.status(403).body("Access denied");
        return ResponseEntity.ok(studentService.getAllMetrics());
    }

    @GetMapping("/student-metrics/{studentId}")
    public ResponseEntity<?> getStudentMetrics(HttpServletRequest request, @PathVariable Long studentId) {
        if (!isFaculty(request)) return ResponseEntity.status(403).body("Access denied");
        StudentMetrics m = studentService.getMetricsByStudentId(studentId);
        if (m == null) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(m);
    }
}