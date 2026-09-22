import { getDatabase } from "../database/database";
import {syncApi} from '../services/syncApi';

export const SyncRepository = {
    async getPendingChanges(){
        const db = await getDatabase();
        const [result] = await db.executeSql(
            `
            SELECT *
            FROM sync_queue
            ORDER BY id ASC;
            `
        );
        const changes = [];

        for (let i =0;i<result.rows.length;i++){
            const row = result.rows.item(i);
            changes.push({
                id: row.id,
                entity: row.entity,
                operation: row.operation,
                clientId: row.client_id,
                entityId: row.entity_id,
                data: row.data ? JSON.parse(row.data): undefined,
                createdAt: row.created_at,
            });
        }
        return changes;
    },

    async sync(){
        const pending = await this.getPendingChanges();
        if(pending.length === 0){
            return;
        }
        const db = await getDatabase();
        const changes = pending.map(item => ({
            entity: item.entity,
            operation: item.operation,
            clientId: item.clientId,
            entityId: item.entityId,
            data: item.data,
        }));

        const response = await syncApi.fullSync({
            deviceId: 'device_123',
            lastSyncAt: null,
            changes,
        });

        const accepted = response.data.accepted ?? [];

        for (const item of accepted){
            await db.executeSql(
                `
                DELETE FROM sync_queue
                WHERE client_id=?;
                `,[item.clientId],
            );

            await db.executeSql(`
                UPDATE expenses
                SET 
                    id = ?,
                    sync_status = ?
                WHERE client_id = ?
                `,[
                    item.serverId,
                    'synced',
                    item.clientId
                ],);
        }
        return response;
    },
};
