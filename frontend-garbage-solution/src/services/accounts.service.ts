import { api } from './api';


interface RegisterData{
    username: '',
    email: '',
    governmentIdType: '',
    governmentIdNumber: '',
    governmentIdIssuingCountry: '',
    governmentIdExpirationDate: ''
  }
interface AccountData {
  accountNumber: string;
  balance: number;
  accountType: string;
}

export const accountsService = {
  me : async (): Promise<void> => {
    return api.get('/Accounts/users/' + localStorage.getItem('userId'), true);
  },
  update : async (data: RegisterData): Promise<void> => {
    return api.put('/Accounts/users/' + localStorage.getItem('userId'), data);
  },
  
  createAccount : async (data: AccountData): Promise<void> => {
    return api.post('/Accounts/users/' + localStorage.getItem('userId') + '/accounts', data);
  },
  getAccounts : async (): Promise<void> => {
    return api.get('/Accounts/users/' + localStorage.getItem('userId') + '/accounts');
  },
  getAccount : async (accountId: string): Promise<void> => {
    return api.get('/Accounts/accounts/' + accountId);
  },
  deleteAccount : async (accountId: string): Promise<void> => {
    return api.delete('/Accounts/accounts/' + accountId);
  }


}


