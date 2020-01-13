export interface ITransaction {
    amount: number;
    amount_cents: number;
    attachment_ids: string[];
    currency: string;
    emitted_at: Date;
    label: string;
    label_ids: string[];
    local_amount_cents: number;
    local_currency: string;
    local_amount: number;
    note: string;
    operation_type: string;
    reference: string;
    settled_at: Date;
    side: string;
    status: string;
    transaction_id: string;
    updated_at: Date;
    vat_amount: number;
    vat_amount_cents: number;
    vat_rate: number;
}
