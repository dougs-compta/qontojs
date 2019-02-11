export interface ITransaction {
    amount: number;
    amount_cents: number;
    attachment_ids: string[];
    currency: string;
    emitted_at: string;
    label: string;
    local_amount_cents: number;
    local_currency: string;
    local_amount: number;
    note: string;
    operation_type: string;
    reference: string;
    settled_at: string;
    side: string;
    status: string;
    transaction_id: string;
    updated_at: string;
    vat_amount: number;
    vat_amount_cents: number;
    vat_rate: number;
}
