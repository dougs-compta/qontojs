import * as rp from 'request-promise';
import { BankAccount } from './BankAccount';
import { HOSTNAME, ORGANIZATION_PATH } from '../constant';
import { IBankAccount } from '../interfaces/bankAccount.interface';
import { ICredentials } from '../interfaces/credentials.interface';
import { IOrganization } from '../interfaces/organization.interface';

export class Organization {
    public readonly slug: string;
    public readonly bankAccounts: BankAccount[] = [];
    private credentials: ICredentials;

    private constructor(data: IOrganization, credentials: ICredentials) {
        this.credentials = credentials;
        this.slug = data.slug;
        this.bankAccounts = data.bank_accounts.map((bankAccount: IBankAccount) => {
            return new BankAccount(bankAccount, this.credentials);
        });
    }

    /**
     * Get the organization from qonto and all the linked bank accounts.
     * ```typescript
     *      const organization = await Organization.get(credentials);
     * ```
     * @param {ICredentials} credentials
     * @return {Promise<Organization>}
     */
    public static async build(credentials: ICredentials): Promise<Organization> {
        const { organization: rawOrganization } = await rp({
            uri: `${HOSTNAME}/${ORGANIZATION_PATH}/${credentials.slug}`,
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `${credentials.slug}:${credentials.secretKey}`
            },
            json: true
        });

        return new Organization(rawOrganization, credentials);
    }
}
