import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import { getCurrencySymbol } from '../data/accountTypeContent';

interface DeleteAccountModalProps {
  show: boolean;
  onHide: () => void;
  onConfirm: () => void;
  accountNumber: string;
  balance: number;
  accountType: string;
  isDeleting: boolean;
}

const DeleteAccountModal: React.FC<DeleteAccountModalProps> = ({
  show,
  onHide,
  onConfirm,
  accountNumber,
  balance,
  accountType,
  isDeleting
}) => {
  const formattedBalance = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(balance);

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Confirm Account Deletion</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>Are you sure you want to delete this account?</p>
        <p><strong>Account Number:</strong> {accountNumber}</p>
        <p><strong>Balance:</strong> {getCurrencySymbol(accountType)} {formattedBalance}</p>
        <p className="text-danger">This action cannot be undone.</p>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Cancel
        </Button>
        <Button
          variant="danger"
          onClick={onConfirm}
          disabled={isDeleting}
        >
          {isDeleting ? 'Deleting...' : 'Delete Account'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default DeleteAccountModal; 