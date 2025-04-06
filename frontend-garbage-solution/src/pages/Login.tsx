import { Card, Form, Button } from 'react-bootstrap';
import { authService } from '../services/auth.service';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const initialFormData = {
  username: '',
  password: ''
} 


const Login = () => {
  const [formData, setFormData] = useState(initialFormData);
  const navigate = useNavigate();

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  }
  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const jwt = await authService.login(formData);
    const decodedToken = JSON.parse(atob(jwt.token.split('.')[1]));
    

    localStorage.setItem('userId', decodedToken.sub);
    localStorage.setItem('jwt', jwt.token);
    localStorage.setItem('refreshToken', jwt.refreshToken);

    navigate('/profile');
  }

  useEffect(() => {
    if (localStorage.getItem('token')) {
      navigate('/profile');
    }
  }, [navigate]);


  return (
    <div className="d-flex align-items-center justify-content-center min-vh-100 flex-column">
      <Card style={{ width: '100%', maxWidth: '400px' }}>
        <Card.Header className="text-center">
          <h1>Login Page</h1>
        </Card.Header>
        <Card.Body>
          <Form onSubmit={onSubmit}>
            <Form.Group className="mb-3" controlId="formBasicEmail">
              <Form.Label>Username</Form.Label>
              <Form.Control type="text" placeholder="Enter username" name="username" onChange={onChange} />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formBasicPassword">
              <Form.Label>Password</Form.Label>
              <Form.Control type="password" placeholder="Password" name="password" onChange={onChange} />
            </Form.Group>

            <Button variant="primary" type="submit" className="w-100">
              Login
            </Button>
          </Form>
        </Card.Body>
      </Card>
      <div className="text-center mt-3" style={{ maxWidth: '400px' }}>
        <p className="text-muted">
          Don't have an account? <a href="/register">Register here</a>
        </p>
      </div>
    </div>
  );
};

export default Login;
