import * as request from 'request';
import * as rp from 'request-promise';
import * as stream from 'stream';
import { IAttachment } from '../interfaces/attachment.interface';
import { Transaction } from './Transaction';

export class Attachment {
    public readonly transaction: Transaction;
    public readonly id: string;
    public readonly createdAt: string;
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

    /***
     * Allow you to download the file and get a readableStream as a result.
     * ```typescript
     *      const fileStream = await attachment.downloadAsStream();
     * ```
     * @return {Promise<"stream".internal.Readable>}
     */
    public async downloadAsStream(): Promise<stream.Readable> {
        return await new Promise((resolve, reject) => {
            return request(this.url, (err, res) => {
                if (err) reject(err);
                if (res.statusCode !== 200) reject(res.statusMessage);
                return resolve(res);
            })
        });
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
