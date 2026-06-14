package com.example.demo.dto;

public class UpdateMetricsRequest {
    private Long studentId;
    private double marks;
    private double attendance;

    public Long getStudentId() { return studentId; }
    public void setStudentId(Long studentId) { this.studentId = studentId; }
    public double getMarks() { return marks; }
    public void setMarks(double marks) { this.marks = marks; }
    public double getAttendance() { return attendance; }
    public void setAttendance(double attendance) { this.attendance = attendance; }
}
