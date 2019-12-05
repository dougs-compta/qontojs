import * as request from 'request';
import * as rp from 'request-promise';
import { LABELS_PATH, HOSTNAME } from '../constant';
import { ILabel } from '../interfaces/label.interface';
import { ICredentials } from '../interfaces/credentials.interface';

export class Label {
    public readonly id: string;
    public readonly name: string;
    public readonly parent_id: string;

    constructor(data: ILabel) {
        this.id = data.id;
        this.name = data.name;
        this.parent_id = data.parent_id;
    }

    static async get(credentials: ICredentials): Promise<Label[]> {
        let pagination = {
            next_page: 1
        };
        let get: Label[] = [];

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

            if (!rawLabels) throw new Error("Unable to find organization's labels");
            get = get.concat(rawLabels.map(rawLabel => new Label(rawLabel)));
        }

        return get;
    }

    static async getById(id: string, credentials: ICredentials, labelsCached?: Label[]): Promise<Label> {
        let labels = Array.isArray(labelsCached) ? labelsCached : await this.get(credentials);
        const label = labels.find(l => l.id === id);
        if (!label) throw new Error('Unable to find the label with the id ' + id);
        return label;
    }
}
