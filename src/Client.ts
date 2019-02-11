import { BankAccount } from './core/BankAccount';
import { ICredentials } from './interfaces/credentials.interface';
import { Organization } from './core/Organization';

export class Client {
    private credentials: ICredentials;
    private organization: Organization;

    constructor(credentials: ICredentials) {
        this.credentials = credentials;
    }

    /***
     * Return all the bank accounts for the actual credentials (link to the organization).
     * @return {Promise<BankAccount[]>}
     */
    public async fetchBankAccounts(): Promise<BankAccount[]> {
        await this._initOrganisation();
        return this.organization.bankAccounts;
    }

    /***
     * Return the bank account for the actual credentials and the given slug (link to the organization).
     * @param {string} slug
     * @return {Promise<BankAccount>}
     */
    public async getBankAccount(slug: string): Promise<BankAccount> {
        await this._initOrganisation();
        return this.organization.bankAccounts.find(b => b.slug === slug);
    }

    /***
     * Initiate the organization using the credentials
     * @return {Promise<void>}
     * @private
     */
    private async _initOrganisation(): Promise<void> {
        if (this.organization) return;
        this.organization = await Organization.build(this.credentials);
    }
}
