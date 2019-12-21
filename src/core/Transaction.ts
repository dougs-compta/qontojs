import { Attachment } from './Attachments';
import { ICredentials } from '../interfaces/credentials.interface';
import { ITransaction } from '../interfaces/transaction.interface';
import { omit } from 'lodash';
import { Label } from './Label';
import { LabelNotFoundError } from '../errors/LabelNotFoundError';

export class Transaction {
    private credentials: ICredentials;
    private _attachments: Attachment[] = [];
    private _labels: Label[] = [];

    public readonly amount: number;
    public readonly amountCents: number;
    public readonly attachmentIds: string[];
    public readonly currency: string;
    public readonly emittedAt: Date;
    public readonly label: string;
    public readonly labelIds: string[];
    public readonly localAmount: number;
    public readonly localAmountCents: number;
    public readonly localCurrency: string;
    public readonly note: string;
    public readonly operationType: string;
    public readonly reference: string;
    public readonly settledAt: Date;
    public readonly side: string;
    public readonly status: string;
    public readonly transactionId: string;
    public readonly updatedAt: Date;
    public readonly vatAmount: number;
    public readonly vatAmountCents: number;
    public readonly vatRate: number;

    public get attachments(): Attachment[] {
        return this._attachments;
    }

    public get labels(): Label[] {
        return this._labels;
    }

    constructor(data: ITransaction, credentials: ICredentials) {
        this.credentials = credentials;
        this.amount = data.amount;
        this.amountCents = data.amount_cents;
        this.attachmentIds = data.attachment_ids;
        this.currency = data.currency;
        this.emittedAt = data.emitted_at;
        this.label = data.label;
        this.labelIds = data.label_ids;
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
            const attachment = await Attachment.get(attachmentId, this.credentials);
            if (attachment) this._attachments.push(attachment);
        }
        return this._attachments;
    }

    public applyLabels(labels: Label[]): Label[] {
        this._labels.length = 0;
        if (labels.length && this.labelIds.length) {
            for (const labelId of this.labelIds) {
                const label = labels.find(l => l.id === labelId);
                if (!label) throw new LabelNotFoundError(`Unable to find label for id ${labelId}`);
                this._labels.push(label);
            }
        }
        return this._labels;
    }

    public toJSON(): Partial<Transaction> {
        return omit(this, ['credentials']);
    }
}
