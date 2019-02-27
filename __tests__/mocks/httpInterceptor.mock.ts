import * as nock from 'nock';
import { ATTACHMENTS_PATH, HOSTNAME, ORGANIZATION_PATH, TRANSACTIONS_PATH } from '../../src/constant';
import { organizationJson } from '../fixtures/organization';
import { transactionsJson } from '../fixtures/transactions';
import { attachmentJson } from '../fixtures/attachment';

export const activateNockInterceptor = () => {
    if (!nock.isActive()) {
        nock.activate();
    }
    nock(HOSTNAME)
        .get(new RegExp(`/${ORGANIZATION_PATH}`))
        .reply(200, organizationJson);

    nock(HOSTNAME)
        .get(new RegExp(`/${TRANSACTIONS_PATH}`))
        .reply(200, transactionsJson);

    nock(HOSTNAME)
        .get(new RegExp(`/${TRANSACTIONS_PATH}`))
        .reply(200, transactionsJson);

    nock(HOSTNAME)
        .get(new RegExp(`/${ATTACHMENTS_PATH}`))
        .reply(200, attachmentJson);
};

export const turnOff = () => nock.restore() && nock.cleanAll();
