
import {apiClient} from './apiClient';

import {SyncRequest} from '../types/sync.types';

export const syncApi = {
  fullSync: async (payload: SyncRequest) => {
    const response = await apiClient.post(
      '/sync',
      payload,
    );

    return response.data;
  },
};