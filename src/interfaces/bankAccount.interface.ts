export interface IBankAccount {
    authorized_balance: number;
    authorized_balance_cents: number;
    balance: number;
    balance_cents: number;
    bic: string;
    currency: string;
    iban: string;
    slug: string;
}
