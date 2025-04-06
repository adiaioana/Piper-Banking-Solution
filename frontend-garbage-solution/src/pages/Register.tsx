import { Card, Form, Button, Row, Col } from 'react-bootstrap';
import { useState } from 'react';
import { authService, RegisterData } from '../services/auth.service';
import { useNavigate } from 'react-router-dom';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<RegisterData>({
    username: '',
    email: '',
    governmentIdType: '',
    governmentIdNumber: '',
    governmentIdIssuingCountry: '',
    governmentIdExpirationDate: ''
  });
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    
    try {
      // Create a copy of form data to modify
      const dataToSubmit = { ...formData };
      
      // Convert the date to UTC if it exists
      if (dataToSubmit.governmentIdExpirationDate) {
        const date = new Date(dataToSubmit.governmentIdExpirationDate);
        // Format as ISO string with UTC timezone
        dataToSubmit.governmentIdExpirationDate = date.toISOString();
      }
      
      // Register the user
      const response = await authService.register(password,dataToSubmit);
      const loginResponse = await authService.login({username: dataToSubmit.username, password: password});
      
      // Redirect to dashboard or home page
      navigate('/profile');
    } catch (err: any) {
      console.error('Registration error:', err);
      setError(err.response?.data || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="d-flex align-items-center justify-content-center min-vh-100 flex-column">
      <Card style={{ width: '100%', maxWidth: '800px' }}>
        <Card.Header className="text-center">
          <h1>Register</h1>
        </Card.Header>
        <Card.Body>
          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}
          <Form onSubmit={handleSubmit}>
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group controlId="formUsername">
                  <Form.Label>Username</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter username"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group controlId="formEmail">
                  <Form.Label>Email address</Form.Label>
                  <Form.Control
                    type="email"
                    placeholder="Enter email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3" controlId="formPassword">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="Password"
                value={password}
                onChange={handlePasswordChange}
                required
              />
            </Form.Group>

            <Row className="mb-3">
              <Col md={4}>
                <Form.Group controlId="formGovernmentIdType">
                  <Form.Label>Government ID Type</Form.Label>
                  <Form.Select
                    name="governmentIdType"
                    value={formData.governmentIdType}
                    onChange={handleChange}
                  >
                    <option value="">Select ID Type</option>
                    <option value="passport">Passport</option>
                    <option value="drivers_license">Driver's License</option>
                    <option value="national_id">National ID</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group controlId="formGovernmentIdNumber">
                  <Form.Label>Government ID Number</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter ID number"
                    name="governmentIdNumber"
                    value={formData.governmentIdNumber}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group controlId="formGovernmentIdExpirationDate">
                  <Form.Label>ID Expiration Date</Form.Label>
                  <Form.Control
                    type="date"
                    name="governmentIdExpirationDate"
                    value={formData.governmentIdExpirationDate}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3" controlId="formGovernmentIdIssuingCountry">
              <Form.Label>Issuing Country</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter issuing country"
                name="governmentIdIssuingCountry"
                value={formData.governmentIdIssuingCountry}
                onChange={handleChange}
              />
            </Form.Group>

            <Button 
              variant="primary" 
              type="submit" 
              className="w-100"
              disabled={isLoading}
            >
              {isLoading ? 'Registering...' : 'Register'}
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
};

export default Register; 