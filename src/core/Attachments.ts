import * as request from 'request';
import * as rp from 'request-promise';
import * as stream from 'stream';
import { ATTACHMENTS_PATH, HOSTNAME } from "../constant";
import { IAttachment } from '../interfaces/attachment.interface';
import { ICredentials } from "../interfaces/credentials.interface";
import { Transaction } from './Transaction';

export class Attachment {
    public readonly transaction: Transaction;
    public readonly id: string;
    public readonly createdAt: Date;
    public readonly fileName: string;
    public readonly fileSize: string;
    public readonly fileContentType: string;
    public readonly url: string;

    constructor(data: IAttachment, transaction: Transaction) {
        this.transaction = transaction;
        this.id = data.id;
        this.createdAt = data.created_at;
        this.fileName = data.file_name;
        this.fileSize = data.file_size;
        this.fileContentType = data.file_content_type;
        this.url = data.url;
    }

    static async get(id: string, credentials: ICredentials): Promise<Attachment> {
        const { attachment: rawAttachment } = await rp({
            uri: `${HOSTNAME}/${ATTACHMENTS_PATH}/${id}`,
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `${credentials.slug}:${credentials.secretKey}`
            },
            json: true
        });
        if (!rawAttachment) throw new Error('Unable to find the attachment with the id ' + id);
        return new Attachment(rawAttachment, null);
    }

    /***
     * Allow you to download the file and get a readableStream as a result.
     * ```typescript
     *      const fileStream = await attachment.downloadAsStream();
     * ```
     * @return {Promise<"stream".internal.Readable>}
     */
    public async downloadAsStream(): Promise<stream.Readable> {
        return (await new Promise((resolve, reject) => {
            return request(this.url, (err, res) => {
                if (err) reject(err);
                if (res.statusCode !== 200) reject(res.statusMessage);
                return resolve(res);
            });
        })) as stream.Readable;
    }

    /***
     * Allow you to download the file and get a buffer as a result.
     * ```typescript
     *      const fileBuffer = await attachment.downloadAsBuffer();
     * ```
     * @return {Promise<"stream".internal.Readable>}
     */
    public async downloadAsBuffer(): Promise<Buffer> {
        return await rp(this.url).then(res => new Buffer(res));
    }
}
