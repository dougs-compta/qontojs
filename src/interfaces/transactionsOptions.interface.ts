export interface ITransactionsFetchOptions {
    filters?: { updatedAtFrom: string; updatedAtTo: string };
    perPage?: number;
    sortBy?: string;
    status?: Array<'pending' | 'reversed' | 'declined' | 'completed'>;
}
