import React, { useState } from 'react';
import { Modal, Form, Button } from 'react-bootstrap';
import { accountsService } from '../services/accounts.service';

interface AccountData {
  accountNumber: string;
  balance: number;
  accountType: string;
}

interface AccountModalProps {
  show: boolean;
  onHide: () => void;
  onSubmit: (account: AccountData) => void;
}

const AccountModal: React.FC<AccountModalProps> = ({ show, onHide, onSubmit }) => {
  const [newAccount, setNewAccount] = useState<AccountData>({
    accountNumber: '',
    balance: 0,
    accountType: 'RON'
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewAccount(prev => ({
      ...prev,
      [name]: name === 'balance' ? parseFloat(value) || 0 : value
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!newAccount.accountNumber.trim()) {
      newErrors.accountNumber = 'Account number is required';
    }
    
    if (newAccount.balance < 0) {
      newErrors.balance = 'Balance cannot be negative';
    }
    
    if (!newAccount.accountType) {
      newErrors.accountType = 'Account type is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(newAccount);
      resetForm();

      accountsService.createAccount(newAccount);
    }
  };

  const resetForm = () => {
    setNewAccount({
      accountNumber: '',
      balance: 0,
      accountType: 'RON'
    });
    setErrors({});
  };

  const handleClose = () => {
    resetForm();
    onHide();
  };

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Add New Account</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Account Number</Form.Label>
            <Form.Control
              type="text"
              name="accountNumber"
              value={newAccount.accountNumber}
              onChange={handleInputChange}
              placeholder="Enter account number"
              isInvalid={!!errors.accountNumber}
            />
            <Form.Control.Feedback type="invalid">
              {errors.accountNumber}
            </Form.Control.Feedback>
          </Form.Group>
          
          <Form.Group className="mb-3">
            <Form.Label>Balance</Form.Label>
            <Form.Control
              type="number"
              name="balance"
              value={newAccount.balance}
              onChange={handleInputChange}
              placeholder="Enter initial balance"
              step="0.01"
              min="0"
              isInvalid={!!errors.balance}
            />
            <Form.Control.Feedback type="invalid">
              {errors.balance}
            </Form.Control.Feedback>
          </Form.Group>
          
          <Form.Group className="mb-3">
            <Form.Label>Account Type</Form.Label>
            <Form.Select
              name="accountType"
              value={newAccount.accountType}
              onChange={handleInputChange}
              isInvalid={!!errors.accountType}
            >
              <option value="">Select account type</option>
              <option value="RON">Romanian Leu (RON)</option>
              <option value="EUR">Euro (EUR)</option>
              <option value="USD">US Dollar (USD)</option>
              <option value="GBP">British Pound (GBP)</option>
              <option value="JPY">Japanese Yen (JPY)</option>
              <option value="CNY">Chinese Yuan (CNY)</option>
              <option value="INR">Indian Rupee (INR)</option>
              <option value="AUD">Australian Dollar (AUD)</option>
              <option value="CAD">Canadian Dollar (CAD)</option>
              <option value="CHF">Swiss Franc (CHF)</option>
            </Form.Select>
            <Form.Control.Feedback type="invalid">
              {errors.accountType}
            </Form.Control.Feedback>
          </Form.Group>
          
          <div className="d-flex justify-content-end">
            <Button variant="secondary" className="me-2" onClick={handleClose}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Create Account
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default AccountModal; 