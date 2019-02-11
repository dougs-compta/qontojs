import * as httpRequestMock from './mocks/httpInterceptor.mock';
import * as stream from 'stream';
import { Client } from '../Client';
import { ICredentials } from '../interfaces/credentials.interface';

const credentials: ICredentials = {
    slug: 'qonto-test-123',
    secretKey: 'efsgjlk353454'
};
const bankAccountSlug = 'qonto-tati-17-bank-account-1';

describe('The client', function() {
    beforeEach(() => httpRequestMock.activateNockInterceptor());
    afterAll(() => httpRequestMock.turnOff());
    it('should be able to return all the accounts for an organization', async function() {
        const client = new Client(credentials);
        const bankAccounts = await client.fetchBankAccounts();

        expect(client).toBeTruthy();
        expect(bankAccounts.length).toEqual(1);
    });

    it('should be able to return the asked account', async function() {
        const client = new Client(credentials);
        const bankAccount = await client.getBankAccount(bankAccountSlug);

        expect(bankAccount).toBeTruthy();
        expect(bankAccount.slug).toEqual(bankAccountSlug);
    });

    describe('The bankAccount', function() {
        it('should be able to fetch transactions using pagination', async function() {
            jest.setTimeout(15000);

            const client = new Client(credentials);
            const bankAccount = await client.getBankAccount(bankAccountSlug);

            expect(bankAccount.transactionsCollection.length).toEqual(0);

            expect(bankAccount.transactionsCollection.hasNext).toEqual(true);
            expect(bankAccount.transactionsCollection.nextPage).toEqual(1);
            expect(bankAccount.transactionsCollection.prevPage).toEqual(null);
            expect(bankAccount.transactionsCollection.totalPages).toEqual(null);
            expect(bankAccount.transactionsCollection.totalCount).toEqual(null);
            expect(bankAccount.transactionsCollection.currentPage).toEqual(1);

            await bankAccount.transactionsCollection.fetchNextPage();

            expect(bankAccount.transactionsCollection.hasNext).toEqual(false);
            expect(bankAccount.transactionsCollection.nextPage).toEqual(null);
            expect(bankAccount.transactionsCollection.prevPage).toEqual(null);
            expect(bankAccount.transactionsCollection.totalPages).toEqual(1);
            expect(bankAccount.transactionsCollection.totalCount).toEqual(1);
            expect(bankAccount.transactionsCollection.currentPage).toEqual(1);
        });

        it('should be able to fetch transactions filtered by status', async function() {
            const client = new Client(credentials);
            const bankAccount = await client.getBankAccount(bankAccountSlug);
            await bankAccount.transactionsCollection.fetchNextPage({
                status: ['completed']
            });

            expect(bankAccount.transactionsCollection.length).toEqual(1);
            expect(bankAccount.transactionsCollection.every(t => t.status === 'completed')).toEqual(true);
        });
    });

    describe('The transaction', function() {
        it('should be able to fetch its attachments', async function() {
            const client = new Client(credentials);
            const transactions = await (await client.getBankAccount(bankAccountSlug)).transactionsCollection.fetchNextPage();
            const transactionWithAttachments = transactions.find(t => !!t.attachmentIds.length);
            const attachments = await transactionWithAttachments.fetchAttachments();

            expect(attachments.length).toEqual(1);
            expect(attachments[0].id).toEqual(transactionWithAttachments.attachmentIds[0]);
            expect(attachments[0].url).not.toBeNull();
        });

        it('should be able to download an attachment as a buffer', async function() {
            const client = new Client(credentials);
            const transactions = await (await client.getBankAccount(bankAccountSlug)).transactionsCollection.fetchNextPage();
            const transactionWithAttachments = transactions.find(t => !!t.attachmentIds.length);
            const attachments = await transactionWithAttachments.fetchAttachments();
            const buffer = await attachments[0].downloadAsBuffer();

            expect(buffer).not.toBeNull();
            expect(Buffer.isBuffer(buffer)).toEqual(true);
        });

        it('should be able to download an attachment as a stream', async function() {
            const client = new Client(credentials);
            const transactions = await (await client.getBankAccount(bankAccountSlug)).transactionsCollection.fetchNextPage();
            const transactionWithAttachments = transactions.find(t => !!t.attachmentIds.length);
            const attachments = await transactionWithAttachments.fetchAttachments();
            const fileStream = await attachments[0].downloadAsStream();

            expect(fileStream instanceof stream.Readable).toEqual(true);
        });
    });
});
