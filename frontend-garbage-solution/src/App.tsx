import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Profile from './pages/Profile';
import Register from './pages/Register';
import { useEffect } from 'react';
import { authService } from './services/auth.service';

function AppContent() {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('jwt');
    const refreshToken = localStorage.getItem('refreshToken');
    if (token && refreshToken) {
      authService.refresh(token, refreshToken);
    }
  }, []);

  const buttons = [
    ...(!localStorage.getItem('jwt') && !localStorage.getItem('refreshToken') ? [{ 
      name: 'Login', 
      onClick: () => navigate('/login')
    },] : []),
    { 
      name: 'Home', 
      onClick: () => navigate('/')
    },
    ...(localStorage.getItem('jwt') && localStorage.getItem('refreshToken') ? [{
      name: 'My Profile',
      onClick: () => navigate('/profile')
    },
    {
      name: 'Logout',
      onClick: async () => {
        const token = localStorage.getItem('jwt');
        const refreshToken = localStorage.getItem('refreshToken');
        if (token && refreshToken) {
          localStorage.removeItem('jwt');
          localStorage.removeItem('refreshToken');        

          authService.logout(token, refreshToken);
          
          navigate('/');
        }
      }
    }
    ] : [])
  ];

  return (
    <div>
      <Navbar buttons={buttons} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
