import React, { useState } from 'react';
import { ListGroup, ListGroupItem, Collapse, Button } from 'react-bootstrap';
import Account from './Account';
import AccountModal from './AccountModal';

interface AccountData {
  accountId: string;
  accountNumber: string;
  balance: number;
  accountType: string;
}

interface AccountsListProps {
  accounts: AccountData[];
  onAddAccount?: (account: AccountData) => void;
}

const AccountsList: React.FC<AccountsListProps> = ({ accounts, onAddAccount }) => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const handleToggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const handleShowAddModal = () => {
    setShowAddModal(true);
  };

  const handleCloseAddModal = () => {
    setShowAddModal(false);
  };

  const handleAddAccount = (account: AccountData) => {
    if (onAddAccount) {
      onAddAccount(account);
    }
    handleCloseAddModal();
  };

  return (
    <div className="accounts-list">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3>Your Accounts</h3>
        <Button variant="success" onClick={handleShowAddModal}>
          Add New Account
        </Button>
      </div>
      
      {accounts.length === 0 ? (
        <div className="alert alert-info">
          You don't have any accounts yet.
        </div>
      ) : (
        <div 
          className="accounts-container" 
          style={{ 
            overflowY: 'auto',
            scrollbarWidth: 'thin',
            scrollbarColor: '#6c757d #f8f9fa'
          }}
        >
          <ListGroup>
            {accounts.map((account, index) => (
              <React.Fragment key={account.accountNumber}>
                <ListGroupItem 
                  action 
                  onClick={() => handleToggle(index)}
                  className="d-flex justify-content-between align-items-center"
                >
                  <div>
                    <strong>Account {index + 1}</strong>
                    <div className="text-muted small">
                      {account.accountNumber}
                    </div>
                  </div>
                  <div className="text-end">
                    <div>
                      {new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: account.accountType
                      }).format(account.balance)}
                    </div>
                    <small className="text-muted">
                      {openIndex === index ? 'Click to hide details' : 'Click to view details'}
                    </small>
                  </div>
                </ListGroupItem>
                
                <Collapse in={openIndex === index}>
                  <div className="p-3 bg-light">
                    <Account 
                      accountId={account.accountId}
                      accountNumber={account.accountNumber}
                      balance={account.balance}
                      accountType={account.accountType}
                    />
                  </div>
                </Collapse>
              </React.Fragment>
            ))}
          </ListGroup>
        </div>
      )}

      <AccountModal 
        show={showAddModal}
        onHide={handleCloseAddModal}
        onSubmit={handleAddAccount}
      />
    </div>
  );
};

export default AccountsList; 