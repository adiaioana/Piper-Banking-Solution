import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { accountsService } from '../services/accounts.service';
import { RegisterData } from '../services/auth.service';
import AccountsList from '../components/AccountsList';
import NearbyATMs from '../components/NearbyATMs';
import ReceiptAnalyzer from '../components/ReceiptAnalyzer';

interface AccountData {
  accountId : string
  accountNumber: string;
  balance: number;
  accountType: string;
}

const Profile = () => {
  const [userData, setUserData] = useState<RegisterData>({
    username: '',
    email: '',
    governmentIdType: '',
    governmentIdNumber: '',
    governmentIdIssuingCountry: '',
    governmentIdExpirationDate: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [accounts, setAccounts] = useState<AccountData[]>([]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setIsLoading(true);
        const data = await accountsService.me();
        setUserData(data);
      } catch (err: Error | unknown) {
        setError(err instanceof Error ? err.message : 'Failed to load user data');
      } finally {
        setIsLoading(false);
      }
    };
    const fetchAccounts = async () => {
      try {
        const data = await accountsService.getAccounts();
        setAccounts(data as AccountData[]);
      } catch (err: Error | unknown) {
        console.error('Failed to fetch accounts:', err);
      }
    };

    fetchUserData();
    fetchAccounts();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setUserData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    
    try {
      await accountsService.update(userData);
      setSuccess('Profile updated successfully');
      setIsEditing(false);
    } catch (err: Error | unknown) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
    }
  };

  if (isLoading) {
    return (
      <Container className="py-5">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Loading profile data...</p>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      <Row>
        <Col md={6}>
          <Card className="mb-4 shadow-sm">
            <Card.Header className="bg-primary text-white">
              <h3 className="mb-0">Profile Information</h3>
            </Card.Header>
            <Card.Body>
              {error && <Alert variant="danger">{error}</Alert>}
              {success && <Alert variant="success">{success}</Alert>}
              
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Username</Form.Label>
                  <Form.Control
                    type="text"
                    name="username"
                    value={userData.username}
                    onChange={handleChange}
                    disabled={true}
                  />
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={userData.email}
                    onChange={handleChange}
                    disabled={!isEditing}
                  />
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Government ID Type</Form.Label>
                  <Form.Select
                    name="governmentIdType"
                    value={userData.governmentIdType}
                    onChange={handleChange}
                    disabled={!isEditing}
                  >
                    <option value="">Select ID Type</option>
                    <option value="passport">Passport</option>
                    <option value="drivers_license">Driver's License</option>
                    <option value="national_id">National ID</option>
                  </Form.Select>
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Government ID Number</Form.Label>
                  <Form.Control
                    type="text"
                    name="governmentIdNumber"
                    value={userData.governmentIdNumber}
                    onChange={handleChange}
                    disabled={!isEditing}
                  />
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Government ID Issuing Country</Form.Label>
                  <Form.Control
                    type="text"
                    name="governmentIdIssuingCountry"
                    value={userData.governmentIdIssuingCountry}
                    onChange={handleChange}
                    disabled={!isEditing}
                  />
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Government ID Expiration Date</Form.Label>
                  <Form.Control
                    type="date"
                    name="governmentIdExpirationDate"
                    value={userData.governmentIdExpirationDate ? new Date(userData.governmentIdExpirationDate).toISOString().split('T')[0] : ''}
                    onChange={handleChange}
                    disabled={!isEditing}
                  />
                </Form.Group>
                
                <div className="d-flex justify-content-between">
                  {isEditing ? (
                    <>
                      <Button variant="secondary" onClick={() => setIsEditing(false)}>
                        Cancel
                      </Button>
                      <Button variant="primary" type="submit">
                        Save Changes
                      </Button>
                    </>
                  ) : (
                    <Button variant="primary" onClick={() => setIsEditing(true)}>
                      Edit Profile
                    </Button>
                  )}
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
        <div>
            <AccountsList accounts={accounts} />
        </div>
        <div className='mt-4'>
          <NearbyATMs />
        </div>
        </Col>
      </Row>
      <Row>
        <ReceiptAnalyzer />
      </Row>
    </Container>
  );
};

export default Profile; 