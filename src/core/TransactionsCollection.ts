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

    public get hasNext(): boolean {
        return !!this.nextPage;
    }

    private _currentPage: number = 1;

    public get currentPage(): number {
        return this._currentPage;
    }

    private _nextPage: number = 1;

    public get nextPage(): number {
        return this._nextPage;
    }

    private _prevPage: number = null;

    public get prevPage(): number {
        return this._prevPage;
    }

    private _totalCount: number = null;

    public get totalCount(): number {
        return this._totalCount;
    }

    private _totalPages: number = null;

    public get totalPages(): number {
        return this._totalPages;
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
     *      await bankAccount.transactionRepository.fetchNextPage();
     *      for (const transaction of bankAccount.transactionRepository) {
     *          await transaction.fetchAttachments();
     *      }
     * ```
     * @param {ITransactionsFetchOptions} fetchOptions
     * @return {Promise<this>}
     */
    public async fetchNextPage(fetchOptions: ITransactionsFetchOptions = {}): Promise<this> {
        if (!this.hasNext) {
            this.length = 0;
            return this;
        }
        fetchOptions = fetchOptions || {};
        return await this._fetch({
            currentPage: this.nextPage,
            perPage: 100,
            ...fetchOptions
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
     * @param {ITransactionsFetchOptions} fetchOptions
     * @return {Promise<this>}
     */
    public async fetchPrevPage(fetchOptions?: ITransactionsFetchOptions): Promise<this> {
        if (!this.prevPage) {
            this.length = 0;
            return this;
        }
        fetchOptions = fetchOptions || {};
        return await this._fetch({
            currentPage: this.prevPage,
            perPage: 100,
            ...fetchOptions
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
                slug: this.bankAccount.slug,
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

        this._nextPage = meta.next_page;
        this._currentPage = meta.current_page;
        this._totalPages = meta.total_pages;
        this._totalCount = meta.total_count;
        this._prevPage = meta.prev_page;

        return this;
    }
}
