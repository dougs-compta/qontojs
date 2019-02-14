import * as rp from 'request-promise';
import { Attachment } from './Attachments';
import { ATTACHMENTS_PATH, HOSTNAME } from '../constant';
import { ICredentials } from '../interfaces/credentials.interface';
import { ITransaction } from '../interfaces/transaction.interface';

export class Transaction {
    private credentials: ICredentials;
    private _attachments: Attachment[] = [];

    public readonly amount: number;
    public readonly amountCents: number;
    public readonly attachmentIds: string[];
    public readonly currency: string;
    public readonly emittedAt: string;
    public readonly label: string;
    public readonly localAmount: number;
    public readonly localAmountCents: number;
    public readonly localCurrency: string;
    public readonly note: string;
    public readonly operationType: string;
    public readonly reference: string;
    public readonly settledAt: string;
    public readonly side: string;
    public readonly status: string;
    public readonly transactionId: string;
    public readonly updatedAt: string;
    public readonly vatAmount: number;
    public readonly vatAmountCents: number;
    public readonly vatRate: number;

    public get attachments(): Attachment[] {
        return this._attachments;
    }

    constructor(data: ITransaction, credentials: ICredentials) {
        this.credentials = credentials;
        this.amount = data.amount;
        this.amountCents = data.amount_cents;
        this.attachmentIds = data.attachment_ids;
        this.currency = data.currency;
        this.emittedAt = data.emitted_at;
        this.label = data.label;
        this.localAmount = data.local_amount;
        this.localAmountCents = data.local_amount_cents;
        this.localCurrency = data.local_currency;
        this.note = data.note;
        this.operationType = data.operation_type;
        this.reference = data.reference;
        this.settledAt = data.settled_at;
        this.side = data.side;
        this.status = data.status;
        this.transactionId = data.transaction_id;
        this.updatedAt = data.updated_at;
        this.vatAmount = data.vat_amount;
        this.vatAmountCents = data.vat_amount_cents;
        this.vatRate = data.vat_rate;
    }

    /**
     * Fetch all the attachments on a transaction and store them on the actual transaction.
     * ```typescript
     *      await transaction.fetchAttachments();
     * ```
     * @return {Promise<Attachment[]>}
     */
    public async fetchAttachments(): Promise<Attachment[]> {
        for (const attachmentId of this.attachmentIds) {
            this._attachments = [];
            const { attachment: rawAttachment } = await rp({
                uri: `${HOSTNAME}/${ATTACHMENTS_PATH}/${attachmentId}`,
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `${this.credentials.slug}:${this.credentials.secretKey}`
                },
                json: true
            });
            if (rawAttachment) this._attachments.push(new Attachment(rawAttachment, this));
        }

        return this._attachments;
    }
}
