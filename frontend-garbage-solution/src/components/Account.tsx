import React, { useState } from 'react';
import { Card, Badge, Button, Row, Col } from 'react-bootstrap';
import { accountsService } from '../services/accounts.service';
import { getCurrencySymbol } from '../data/accountTypeContent';
import DeleteAccountModal from './DeleteAccountModal';

interface AccountProps {
  accountId: string;
  accountNumber: string;
  balance: number;
  accountType: string;
  onDelete?: () => void;
}

const Account: React.FC<AccountProps> = ({ accountId, accountNumber, balance, accountType, onDelete }) => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Format the balance with 2 decimal places
  const formattedBalance = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(balance);

  const handleDeleteClick = () => {
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    try {
      setIsDeleting(true);
      await accountsService.deleteAccount(accountId);
      if (onDelete) {
        onDelete();
      }
    } catch (error) {
      console.error('Failed to delete account:', error);
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
  };

  return (
    <>
      <Card className="mb-3 shadow-sm">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center mb-2">
            <Card.Title className="mb-0">Account Details</Card.Title>
            <Badge bg="primary" className="px-3 py-2">
              {getCurrencySymbol(accountType)}
            </Badge>
          </div>

          <Row>
            <Col>
              <div className="mb-3">
                <small className="text-muted d-block">Account Number</small>
                <strong>{accountNumber}</strong>
              </div>
            </Col>
          </Row>

          <Row className="align-items-center">
            <Col>
              <div>
                <small className="text-muted d-block">Balance</small>
                <h3 className="mb-0">
                  {getCurrencySymbol(accountType)} {formattedBalance}
                </h3>
              </div>
            </Col>
            <Col xs="auto">
              <Button
                variant="danger"
                size="sm"
                onClick={handleDeleteClick}
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Delete Account'}
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      <DeleteAccountModal
        show={showDeleteModal}
        onHide={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        accountNumber={accountNumber}
        balance={balance}
        accountType={accountType}
        isDeleting={isDeleting}
      />
    </>
  );
};

export default Account; 