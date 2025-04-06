export const currencySymbols: Record<string, string> = {
  'EUR': '€',
  'USD': '$',
  'GBP': '£',
  'RON': 'Lei',
  'JPY': '¥',
  'CNY': '¥',
  'INR': '₹',
  'AUD': 'A$',
  'CAD': 'C$',
  'CHF': 'Fr',
  'SEK': 'kr',
  'NZD': 'NZ$',
  'MXN': 'Mex$',
  'SGD': 'S$',
  'HKD': 'HK$',
  'NOK': 'kr',
  'KRW': '₩',
  'TRY': '₺',
  'RUB': '₽',
  'BRL': 'R$',
  'ZAR': 'R'
};

export const getCurrencySymbol = (accountType: string): string => {
  return currencySymbols[accountType] || accountType;
};

export const accountTypeOptions = [
  { value: 'RON', label: 'Romanian Leu (RON)' },
  { value: 'EUR', label: 'Euro (EUR)' },
  { value: 'USD', label: 'US Dollar (USD)' },
  { value: 'GBP', label: 'British Pound (GBP)' }
]; 