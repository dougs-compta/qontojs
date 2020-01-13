import * as request from 'request';
import * as rp from 'request-promise';
import { LABELS_PATH, HOSTNAME } from '../constant';
import { ILabel } from '../interfaces/label.interface';
import { ICredentials } from '../interfaces/credentials.interface';

export class Label {
    public readonly id: string;
    public readonly name: string;
    public readonly parentId: string;

    constructor(data: ILabel) {
        this.id = data.id;
        this.name = data.name;
        this.parentId = data.parent_id;
    }

    static async get(credentials: ICredentials): Promise<Label[]> {
        let pagination = {
            next_page: 1
        };

        const labels: Label[] = [];

        while (pagination.next_page) {
            const { labels: rawLabels, meta } = await rp({
                uri: `${HOSTNAME}/${LABELS_PATH}`,
                method: 'GET',
                qs: {
                    current_page: pagination.next_page
                },
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `${credentials.slug}:${credentials.secretKey}`
                },
                json: true
            });

            pagination = meta;
            labels.push(...rawLabels.map((rawLabel: ILabel) => new Label(rawLabel)));
        }

        return labels;
    }
}
