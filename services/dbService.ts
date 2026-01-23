
import { UserQueryRecord } from '../types';

const STORAGE_KEY = 'jharkhand_governance_queries';

export const dbService = {
  saveQuery: (record: UserQueryRecord) => {
    const existing = dbService.getAllQueries();
    existing.push(record);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
  },

  getAllQueries: (): UserQueryRecord[] => {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  },

  getSessionId: (): string => {
    let sid = localStorage.getItem('jharkhand_session_id');
    if (!sid) {
      sid = 'session_' + Math.random().toString(36).substring(2, 11);
      localStorage.setItem('jharkhand_session_id', sid);
    }
    return sid;
  }
};
