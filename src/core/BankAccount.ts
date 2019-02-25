import { IBankAccount } from '../interfaces/bankAccount.interface';
import { ICredentials } from '../interfaces/credentials.interface';
import { TransactionCollection } from "./TransactionCollection";

export class BankAccount {
    private credentials: ICredentials;

    public readonly slug: string;
    public readonly currency: string;
    public readonly balance: number;
    public readonly balanceCents: number;
    public readonly authorizedBalance: number;
    public readonly authorizedBalanceCents: number;
    public readonly transactionCollection: TransactionCollection;
    public readonly iban: string;
    public readonly bic: string;

    constructor(data: IBankAccount, credentials: ICredentials) {
        this.credentials = credentials;
        this.slug = data.slug;
        this.iban = data.iban;
        this.bic = data.bic;
        this.currency = data.currency;
        this.balance = data.balance;
        this.balanceCents = data.balance_cents;
        this.authorizedBalance = data.authorized_balance;
        this.authorizedBalanceCents = data.authorized_balance_cents;
        this.transactionCollection = new TransactionCollection(this.credentials, this);
    }
}
