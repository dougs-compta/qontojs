import * as rp from 'request-promise';
import { BankAccount } from './BankAccount';
import { HOSTNAME, TRANSACTIONS_PATH } from '../constant';
import { ICredentials } from '../interfaces/credentials.interface';
import { ITransaction } from '../interfaces/transaction.interface';
import { ITransactionsFetchOptions } from '../interfaces/transactionsOptions.interface';
import { Transaction } from './Transaction';

export class TransactionsCollection extends Array<Transaction> {
    private credentials: ICredentials;
    private bankAccount: BankAccount;

    private nextPage: number = 1;
    private prevPage: number = null;
    private fetchOptions: ITransactionsFetchOptions = {};

    public get hasNext(): boolean {
        return !!this.nextPage;
    }

    public get hasPrev(): boolean {
        return !!this.prevPage;
    }

    constructor(credentials: ICredentials, bankAccount: BankAccount) {
        super();
        this.credentials = credentials;
        this.bankAccount = bankAccount;
    }

    /***
     * Return the transactions located on the next
     * page and store the new transactions in the actual repository.
     * ```typescript
     *      bankAccount.transactionRepository.setFetchOptions(options);
     * ```
     * @param {ITransactionsFetchOptions} fetchOptions
     * @return {Promise<this>}
     */
    public setFetchOptions(fetchOptions: ITransactionsFetchOptions = {}) {
        this.fetchOptions = fetchOptions || {};
        this.nextPage = 1;
        this.prevPage = 1;
    }

    /***
     * Return the transactions located on the next
     * page and store the new transactions in the actual repository.
     * ```typescript
     *      await bankAccount.transactionRepository.fetchNextPage();
     *      for (const transaction of bankAccount.transactionRepository) {
     *          await transaction.fetchAttachments();
     *      }
     * ```
     * @return {Promise<this>}
     */
    public async fetchNextPage(): Promise<this> {
        if (!this.hasNext) {
            this.length = 0;
            return this;
        }
        return await this._fetch({
            ...this.fetchOptions,
            currentPage: this.nextPage,
            perPage: 100
        });
    }

    /***
     * Return the transactions located on the previous
     * page and store the new transactions in the actual repository.
     * ```typescript
     *      await bankAccount.transactionRepository.fetchPrevPage();
     *      for (const transaction of bankAccount.transactionRepository) {
     *          await transaction.fetchAttachments();
     *      }
     * ```
     * @return {Promise<this>}
     */
    public async fetchPrevPage(): Promise<this> {
        if (!this.hasPrev) {
            this.length = 0;
            return this;
        }
        return await this._fetch({
            ...this.fetchOptions,
            currentPage: this.prevPage,
            perPage: 100
        });
    }

    /***
     * Fetch the transactions asked according to the options and store them in the actual repository.
     * @param {ITransactionsFetchOptions} fetchOptions
     * @return {Promise<this>}
     * @private
     */
    private async _fetch(fetchOptions: ITransactionsFetchOptions & { currentPage }): Promise<this> {
        const { transactions: rawTransactions, meta } = await rp({
            uri: `${HOSTNAME}/${TRANSACTIONS_PATH}`,
            qs: {
                slug: this.bankAccount.id,
                iban: this.bankAccount.iban,
                per_page: fetchOptions.perPage,
                current_page: fetchOptions.currentPage,
                status: fetchOptions.status,
                filters: fetchOptions.filters,
                sortBy: fetchOptions.sortBy
            },
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `${this.credentials.slug}:${this.credentials.secretKey}`
            },
            json: true
        });

        this.length = 0;
        this.push(
            ...rawTransactions.map((rawTransaction: ITransaction) => {
                return new Transaction(rawTransaction, this.credentials);
            })
        );

        this.nextPage = meta.next_page;
        this.prevPage = meta.prev_page;

        return this;
    }
}
