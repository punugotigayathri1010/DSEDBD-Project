package com.example.demo.repository;

import com.example.demo.entity.StudentMetrics;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface StudentMetricsRepository extends JpaRepository<StudentMetrics, Long> {
    StudentMetrics findByStudentId(Long studentId);
    void deleteByStudentId(Long studentId);
}