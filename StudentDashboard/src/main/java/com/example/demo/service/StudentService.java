package com.example.demo.service;

import com.example.demo.dto.AddStudentRequest;
import com.example.demo.dto.UpdateMetricsRequest;
import com.example.demo.entity.*;
import com.example.demo.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.ArrayList;

@Service
public class StudentService {

    @Autowired private UserRepository userRepo;
    @Autowired private StudentRepository studentRepo;
    @Autowired private StudentMetricsRepository metricsRepo;

    @Transactional
    public String addStudent(AddStudentRequest req) {
        if (userRepo.findByEmail(req.getEmail()) != null) {
            return "Error: Email already exists!";
        }

        User user = new User();
        user.setName(req.getName());
        user.setEmail(req.getEmail());
        user.setPassword(req.getPassword());
        user.setRole(Role.STUDENT);
        User savedUser = userRepo.save(user);

        Student student = new Student();
        student.setUserId(savedUser.getId());
        student.setCourse(req.getCourse());
        student.setYear(req.getYear());
        Student saved = studentRepo.save(student);

        StudentMetrics m = new StudentMetrics();
        m.setStudentId(saved.getId());
        m.setMarks(0.0);
        m.setAttendance(0.0);
        metricsRepo.save(m);

        return "Student added. Student ID: " + saved.getId();
    }

    @Transactional
    public String deleteStudent(Long studentId) {
        Student student = studentRepo.findById(studentId).orElse(null);
        if (student == null) return "Error: Student not found";
        
        StudentMetrics m = metricsRepo.findByStudentId(studentId);
        if (m != null) metricsRepo.delete(m);
        
        userRepo.deleteById(student.getUserId());
        studentRepo.deleteById(studentId);
        return "Student deleted successfully";
    }

    public String updateMetrics(UpdateMetricsRequest req) {
        StudentMetrics m = metricsRepo.findByStudentId(req.getStudentId());
        if (m == null) return "Error: Student not found";
        
        m.setMarks(req.getMarks());
        m.setAttendance(req.getAttendance());
        metricsRepo.save(m);
        return "Updated successfully";
    }

    public List<Map<String, Object>> getAllStudents() {
        List<Map<String, Object>> result = new ArrayList<>();
        for (Student student : studentRepo.findAll()) {
            Map<String, Object> row = new HashMap<>();
            row.put("id", student.getId());
            row.put("studentId", student.getId());
            row.put("userId", student.getUserId());
            row.put("course", student.getCourse());
            row.put("year", student.getYear());

            User user = userRepo.findById(student.getUserId()).orElse(null);
            if (user != null) {
                row.put("name", user.getName());
                row.put("email", user.getEmail());
            }

            StudentMetrics metrics = metricsRepo.findByStudentId(student.getId());
            if (metrics != null) {
                row.put("marks", metrics.getMarks());
                row.put("attendance", metrics.getAttendance());
            }

            result.add(row);
        }
        return result;
    }
    public List<StudentMetrics> getAllMetrics() { return metricsRepo.findAll(); }
    public StudentMetrics getMetricsByStudentId(Long id) { return metricsRepo.findByStudentId(id); }
    public User getUserByEmail(String email) { return userRepo.findByEmail(email); }
    public Student getStudentByUserId(Long userId) { return studentRepo.findByUserId(userId); }

    public StudentMetrics getMetricsByUserId(Long userId) {
        Student s = studentRepo.findByUserId(userId);
        if (s == null) return null;
        return metricsRepo.findByStudentId(s.getId());
    }
}