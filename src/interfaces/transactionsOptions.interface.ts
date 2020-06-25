export interface ITransactionsFetchOptions {
    filters?: { updatedAtFrom: string; updatedAtTo: string };
    perPage?: number;
    sortBy?: string;
    status?: ('pending' | 'reversed' | 'declined' | 'completed')[];
    getLabels?: boolean;
}
