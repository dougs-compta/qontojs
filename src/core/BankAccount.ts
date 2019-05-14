import * as rp from 'request-promise';
import { HOSTNAME, ORGANIZATION_PATH } from '../constant';
import { IBankAccount } from '../interfaces/bankAccount.interface';
import { ICredentials } from '../interfaces/credentials.interface';
import { TransactionCollection } from './TransactionCollection';
import { omit } from 'lodash';

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

    static async fetch(credentials: ICredentials): Promise<BankAccount[]> {
        const { organization } = await rp({
            uri: `${HOSTNAME}/${ORGANIZATION_PATH}/${credentials.slug}`,
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `${credentials.slug}:${credentials.secretKey}`
            },
            json: true
        });
        return organization.bank_accounts.map(bankAccount => new BankAccount(bankAccount, credentials));
    }

    public toJSON(): Partial<BankAccount> {
        return omit(this, ['credentials']);
    }
}
