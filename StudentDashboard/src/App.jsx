import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Home from './Home';
import Login from './Login';
import Signup from './Signup';
import FacultyDashboard from './FacultyDashboard';
import StudentDashboard from './StudentDashboard';

function ProtectedRoute({ children, allowedRole }) {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');

    if (!token) return <Navigate to="/" />;
    if (allowedRole && role !== allowedRole) return <Navigate to="/" />;
    
    return children;
}

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/faculty-login" element={<Login expectedRole="FACULTY" title="Faculty Login" />} />
                <Route path="/student-login" element={<Login expectedRole="STUDENT" title="Student Login" />} />
                <Route path="/signup" element={<Signup />} />
                
                <Route path="/faculty" element={
                    <ProtectedRoute allowedRole="FACULTY">
                        <FacultyDashboard />
                    </ProtectedRoute>
                } />
                
                <Route path="/student" element={
                    <ProtectedRoute allowedRole="STUDENT">
                        <StudentDashboard />
                    </ProtectedRoute>
                } />
            </Routes>
        </BrowserRouter>
    );
}
