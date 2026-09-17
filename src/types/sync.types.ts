    export type SyncOperation = 
        | "CREATE"
        | "UPDATE"
        | "DELETE";

    export type SyncEntity = 'expense' | 'income';

    export type PendingChange = {
        id: number;
        entity: SyncEntity;
        operation: SyncOperation;
        clientId: string;
        entityId?: string;
        data?: Record<string, unknown>;
        createdAt: string;
    };

    export type SyncRequest = {
        deviceId: string;
        lastSyncAt: string | null;
        changes: Array<{
            entity: SyncEntity;
            operation: SyncOperation;
            clientId: string;
            data?: Record<string,unknown>;
        }>;
    };

    export type SyncResponse = {
        accepted: Array<{
            clientId: string;
            serverId: string;
        }>;
        updated: unknown[];
        conflicts: unknown[];
        deleted: unknown[];

        serverTimestamp: string;
    }