import * as httpRequestMock from './mocks/httpInterceptor.mock';
import * as stream from 'stream';
import { BankAccount } from '../src';
import { ICredentials } from '../src/interfaces/credentials.interface';

const credentials: ICredentials = {
    slug: 'qonto-test-123',
    secretKey: 'efsgjlk353454'
};
const bankAccountSlug = 'qonto-tati-17-bank-account-1';

describe('The BankAccount', function() {
    beforeEach(() => httpRequestMock.activateNockInterceptor());
    afterAll(() => httpRequestMock.turnOff());
    it('should be able to return all the accounts for an organization', async function() {
        const bankAccounts = await BankAccount.fetch(credentials);
        expect(bankAccounts.length).toEqual(1);
    });

    it('should be able to return the asked account', async function() {
        const bankAccounts = await BankAccount.fetch(credentials);
        const bankAccount = bankAccounts.find(b => b.slug === bankAccountSlug);

        expect(bankAccount).toBeTruthy();
        expect(bankAccount.slug).toEqual(bankAccountSlug);
    });

    describe('The bankAccount', function() {
        it('should be able to fetch transactions using pagination', async function() {
            jest.setTimeout(15000);

            const bankAccounts = await BankAccount.fetch(credentials);
            const bankAccount = bankAccounts.find(b => b.slug === bankAccountSlug);

            expect(bankAccount.transactionCollection.length).toEqual(0);
            expect(bankAccount.transactionCollection.hasNext).toEqual(true);

            await bankAccount.transactionCollection.fetchNextPage();
            expect(bankAccount.transactionCollection.length).toEqual(1);
            expect(bankAccount.transactionCollection.hasNext).toEqual(false);

            const fetchedTransaction = bankAccount.transactionCollection[0];
            await bankAccount.transactionCollection.fetchNextPage();
            expect(bankAccount.transactionCollection[0]).toEqual(fetchedTransaction);
            expect(bankAccount.transactionCollection.length).toEqual(1);
            expect(bankAccount.transactionCollection.hasNext).toEqual(false);
        });

        it('should be able to fetch transactions filtered by status', async function() {
            const bankAccounts = await BankAccount.fetch(credentials);
            const bankAccount = bankAccounts.find(b => b.slug === bankAccountSlug);
            bankAccount.transactionCollection.setFetchOptions({
                status: ['completed']
            });
            await bankAccount.transactionCollection.fetchNextPage();

            expect(bankAccount.transactionCollection.length).toEqual(1);
            expect(bankAccount.transactionCollection.every(t => t.status === 'completed')).toEqual(true);
        });
    });

    describe('The transaction', function() {

        it('should be able to fetch its attachments', async function() {
            const bankAccounts = await BankAccount.fetch(credentials);
            const bankAccount = bankAccounts.find(b => b.slug === bankAccountSlug);
            const transactions = await bankAccount.transactionCollection.fetchNextPage();
            const transactionWithAttachments = transactions.find(t => !!t.attachmentIds.length);
            const attachments = await transactionWithAttachments.fetchAttachments();

            expect(attachments.length).toEqual(1);
            expect(attachments[0].id).toEqual(transactionWithAttachments.attachmentIds[0]);
            expect(attachments[0].url).not.toBeNull();
        });

        it('should be able to download an attachment as a buffer', async function() {
            const bankAccounts = await BankAccount.fetch(credentials);
            const bankAccount = bankAccounts.find(b => b.slug === bankAccountSlug);
            const transactions = await bankAccount.transactionCollection.fetchNextPage();
            const transactionWithAttachments = transactions.find(t => !!t.attachmentIds.length);
            await transactionWithAttachments.fetchAttachments();
            const buffer = await transactionWithAttachments.attachments[0].downloadAsBuffer();

            expect(buffer).not.toBeNull();
            expect(Buffer.isBuffer(buffer)).toEqual(true);
        });

        it('should be able to download an attachment as a stream', async function() {
            const bankAccounts = await BankAccount.fetch(credentials);
            const bankAccount = bankAccounts.find(b => b.slug === bankAccountSlug);
            const transactions = await bankAccount.transactionCollection.fetchNextPage();
            const transactionWithAttachments = transactions.find(t => !!t.attachmentIds.length);
            await transactionWithAttachments.fetchAttachments();
            const fileStream = await transactionWithAttachments.attachments[0].downloadAsStream();

            expect(fileStream instanceof stream.Readable).toEqual(true);
        });

        it('should be able to fetch its labels', async function() {

            const bankAccounts = await BankAccount.fetch(credentials);
            const bankAccount = bankAccounts.find(b => b.slug === bankAccountSlug);

            bankAccount.transactionCollection.setFetchOptions({
                getLabels: true
            });

            const transactions = await bankAccount.transactionCollection.fetchNextPage();

            expect(transactions.length).toEqual(1);
            expect(transactions[0].labelIds.length).toEqual(1);
            expect(transactions[0].labels.length).toEqual(1);

        });

    });
});
