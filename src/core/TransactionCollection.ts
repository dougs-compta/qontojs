import * as rp from 'request-promise';
import { BankAccount } from './BankAccount';
import { HOSTNAME, TRANSACTIONS_PATH } from '../constant';
import { ICredentials } from '../interfaces/credentials.interface';
import { ITransaction } from '../interfaces/transaction.interface';
import { ITransactionsFetchOptions } from '../interfaces/transactionsOptions.interface';
import { Transaction } from './Transaction';
import { omit } from 'lodash';
import { Label } from './Label';
import { LabelNotFoundError } from '../errors/LabelNotFoundError';

export class TransactionCollection extends Array<Transaction> {
    private credentials: ICredentials;
    private bankAccount: BankAccount;

    private nextPage: number = 1;
    private prevPage: number = null;
    private fetchOptions: ITransactionsFetchOptions = {};

    public get hasNext(): boolean {
        return !!this.nextPage;
    }

    constructor(credentials: ICredentials, bankAccount: BankAccount) {
        super();
        this.credentials = credentials;
        this.bankAccount = bankAccount;
        this.setFetchOptions();
    }

    /***
     * Return the transactions located on the next
     * page and store the new transactions in the actual repository.
     * ```typescript
     *      bankAccount.transactionCollection.setFetchOptions(options);
     * ```
     * @param {ITransactionsFetchOptions} fetchOptions
     * @return {Promise<this>}
     */
    public setFetchOptions(fetchOptions: ITransactionsFetchOptions = {}) {
        this.length = 0;
        this.fetchOptions = fetchOptions || {};
        this.nextPage = 1;
        this.prevPage = null;
    }

    /***
     * Return the transactions located on the next
     * page and store the new transactions in the actual repository.
     * ```typescript
     *      await bankAccount.transactionCollection.fetchNextPage();
     *      for (const transaction of bankAccount.transactionCollection) {
     *          await transaction.fetchAttachments();
     *      }
     * ```
     * @return {Promise<this>}
     */
    public async fetchNextPage(): Promise<this> {
        if (!this.hasNext) return this;
        return await this._fetch({
            ...this.fetchOptions,
            perPage: 100,
        });
    }

    public toJSON(): Partial<TransactionCollection> {
        return omit(this, ['credentials']);
    }

    /***
     * Fetch the transactions asked according to the options and store them in the actual repository.
     * @param {ITransactionsFetchOptions} fetchOptions
     * @return {Promise<this>}
     * @private
     */
    private async _fetch(fetchOptions: ITransactionsFetchOptions): Promise<this> {
        const { transactions: rawTransactions, meta } = await rp({
            uri: `${HOSTNAME}/${TRANSACTIONS_PATH}`,
            qs: {
                slug: this.bankAccount.slug,
                iban: this.bankAccount.iban,
                per_page: fetchOptions.perPage,
                current_page: this.nextPage,
                status: fetchOptions.status,
                filters: {
                    updated_at_from: fetchOptions.filters && fetchOptions.filters.updatedAtFrom,
                    updated_at_to: fetchOptions.filters && fetchOptions.filters.updatedAtTo,
                },
                sortBy: fetchOptions.sortBy,
            },
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `${this.credentials.slug}:${this.credentials.secretKey}`,
            },
            json: true,
        });

        this.length = 0;

        let labels = fetchOptions.getLabels === true ? await Label.get(this.credentials) : [];

        for (const rawTransaction of rawTransactions) {
            const transaction = new Transaction(rawTransaction, this.credentials);
            if (fetchOptions.getLabels === true) {
                try {
                    transaction.applyLabels(labels);
                } catch (e) {
                    if (!(e instanceof LabelNotFoundError)) throw e;
                    labels = await Label.get(this.credentials);
                    transaction.applyLabels(labels);
                }
            }
            this.push(transaction);
        }

        this.nextPage = meta.next_page;
        this.prevPage = meta.prev_page;

        return this;
    }
}
