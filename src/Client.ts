import * as rp from 'request-promise';
import { BankAccount } from './core/BankAccount';
import { HOSTNAME, ORGANIZATION_PATH } from './constant';
import { ICredentials } from './interfaces/credentials.interface';

export class Client {
    private credentials: ICredentials;

    constructor(credentials: ICredentials) {
        this.credentials = credentials;
    }

    /***
     * Return all the bank accounts for the actual credentials (link to the organization).
     * @return {Promise<BankAccount[]>}
     */
    public async getBankAccounts(): Promise<BankAccount[]> {
        const { organization } = await rp({
            uri: `${HOSTNAME}/${ORGANIZATION_PATH}/${this.credentials.slug}`,
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `${this.credentials.slug}:${this.credentials.secretKey}`
            },
            json: true
        });
        return organization.bank_accounts.map(bankAccount => new BankAccount(bankAccount, this.credentials));
    }

    /***
     * Return the bank account for the actual credentials and the given slug (link to the organization).
     * @param {string} slug
     * @return {Promise<BankAccount>}
     */
    public async getBankAccount(slug: string): Promise<BankAccount> {
        const { organization } = await rp({
            uri: `${HOSTNAME}/${ORGANIZATION_PATH}/${this.credentials.slug}`,
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `${this.credentials.slug}:${this.credentials.secretKey}`
            },
            json: true
        });
        const account = organization.bank_accounts.find(bankAccount => bankAccount.slug === slug);
        if (!account) throw new Error('Unable to find the bank account wit the slug ' + slug);
        return new BankAccount(account, this.credentials);
    }
}
