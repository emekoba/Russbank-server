export interface IToken {
  accountNumber: number;
  time: number;
}

export enum CurrencyTypes {
  NAIRA = 'NGN',
  DOLLARS = 'DOLLARS',
}

export enum TransactionTypes {
  WITHDRAWAL = 'WITHDRAWAL',
  DEPOSIT = 'DEPOSIT',
  TRANSFER = 'TRANSFER',
}

export enum UserRoles {
  ADMIN = 'ADMIN',
  NORMAL = 'NORMAL',
}
