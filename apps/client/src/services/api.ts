import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const api = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('cs_token');
  if (token) {
    config.headers = config.headers ?? {};
    (config.headers as Record<string, string>).Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('cs_token');
      localStorage.removeItem('cs_user');
    }
    return Promise.reject(err);
  }
);

export interface Schedule {
  time: string;
  timezone: string;
}

export interface Subscription {
  language: string;
  currentTopicIndex: number;
  startedAt: string;
  completedAt: string | null;
  isActive: boolean;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  avatar: string | null;
  schedules: Schedule[];
  subscriptions: Subscription[];
  isVerified: boolean;
  isActive: boolean;
}

export interface AvailableLanguage {
  key: string;
  name: string;
  topicCount: number;
}

export interface CompletedTopic {
  topicIndex: number;
  topicTitle: string;
  sentAt: string;
}

export interface ProgressEntry {
  language: string;
  name: string;
  currentTopicIndex: number;
  totalTopics: number;
  isActive: boolean;
  percentage: number;
  startedAt: string;
  completedAt: string | null;
  completedCount: number;
  completedTopics: CompletedTopic[];
}

export async function register(name: string, email: string, password: string) {
  const { data } = await api.post<{ token: string; user: User }>('/api/auth/register', {
    name,
    email,
    password
  });
  return data;
}

export async function login(email: string, password: string) {
  const { data } = await api.post<{ token: string; user: User }>('/api/auth/login', {
    email,
    password
  });
  return data;
}

export async function getMe() {
  const { data } = await api.get<{ user: User }>('/api/users/me');
  return data.user;
}

export async function updateSchedule(schedules: Schedule[]) {
  const { data } = await api.put<{ user: User }>('/api/users/schedule', { schedules });
  return data.user;
}

export async function updateProfile(name: string, email: string) {
  const { data } = await api.put<{ user: User }>('/api/users/me', { name, email });
  return data.user;
}

export async function updatePassword(currentPassword: string, newPassword: string) {
  const { data } = await api.put<{ ok: boolean }>('/api/users/password', {
    currentPassword,
    newPassword
  });
  return data;
}

export async function updateAvatar(avatar: string | null) {
  const { data } = await api.put<{ user: User }>('/api/users/avatar', { avatar });
  return data.user;
}

export async function updateSubscription(language: string, action?: 'add' | 'remove') {
  const { data } = await api.put<{ user: User }>('/api/users/subscriptions', {
    language,
    action
  });
  return data.user;
}

export async function getLanguages() {
  const { data } = await api.get<{ languages: AvailableLanguage[] }>('/api/schedule/languages');
  return data.languages;
}

export async function getProgress() {
  const { data } = await api.get<{ progress: ProgressEntry[]; totalCompleted: number }>(
    '/api/schedule/progress'
  );
  return { progress: data.progress, totalCompleted: data.totalCompleted };
}

export type DeliveryStatus = 'sent' | 'skipped' | 'error';
export type DeliveryContext = 'scheduler' | 'completion' | 'cli' | 'unknown';

export interface DeliveryLog {
  _id: string;
  to: string;
  from: string | null;
  subject: string;
  language: string | null;
  topicIndex: number | null;
  topicTitle: string | null;
  context: DeliveryContext;
  userId: string | null;
  status: DeliveryStatus;
  messageId: string | null;
  smtpResponse: string | null;
  errorMessage: string | null;
  errorCode: string | null;
  sentAt: string;
}

export interface DeliveryQuery {
  status?: DeliveryStatus;
  language?: string;
  context?: DeliveryContext;
  to?: string;
  limit?: number;
}

export async function getDeliveries(query: DeliveryQuery = {}) {
  const params: Record<string, string> = {};
  if (query.status) params.status = query.status;
  if (query.language) params.language = query.language;
  if (query.context) params.context = query.context;
  if (query.to) params.to = query.to;
  if (query.limit) params.limit = String(query.limit);
  const { data } = await api.get<{
    items: DeliveryLog[];
    total: number;
    returned: number;
    limit: number;
    byStatus: { sent: number; skipped: number; error: number };
  }>('/api/admin/deliveries', { params });
  return data;
}
