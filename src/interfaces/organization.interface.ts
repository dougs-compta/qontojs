import { IBankAccount } from './bankAccount.interface';

export interface IOrganization {
    bank_accounts: IBankAccount[];
    slug?: string;
}
