import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../constants/config';
import { Service, AdminBooking, PaginatedResponse } from '../types';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

let logoutCallback: (() => void) | null = null;

export const setLogoutCallback = (cb: () => void) => {
    logoutCallback = cb;
};

// Request interceptor to add auth token
api.interceptors.request.use(
    async (config) => {
        const token = await AsyncStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const status = error.response?.status;

        if (status === 401 || status === 403) {
            const storedToken = await AsyncStorage.getItem('token');
            const hasNoToken = !storedToken || storedToken === 'null' || storedToken === 'undefined' || storedToken === '';

            if (hasNoToken) {
                if (status === 403) {
                    return Promise.resolve({
                        data: { content: [], data: [], balance: 0 },
                        status: 403,
                        __isSilencedError: true
                    } as any);
                }
            } else {
                await AsyncStorage.multiRemove(['token', 'user']);
                if (logoutCallback) logoutCallback();
            }
        }

        return Promise.reject(error);
    }
);

// Auth APIs
export const authAPI = {
    sendEmailOTP: (email: string) => api.post('/auth/request-email-otp', { email }),
    verifyEmailOTP: (email: string, otp: string) => api.post('/auth/verify-email-otp', { email, otp }),
    // Legacy support for adminAPI
    requestEmailOtp: (email: string) => api.post('/auth/request-email-otp', { email }).then(res => res.data),
    verifyEmailOtp: (email: string, otp: string) => api.post('/auth/verify-email-otp', { email, otp }).then(res => res.data),
};

// Admin/Service APIs
export const adminAPI = {
    ...authAPI,

    // Bookings
    getAdminBookings: async (page?: number, size?: number, date?: string, status?: string): Promise<PaginatedResponse<AdminBooking>> => {
        const params: any = {};
        if (page !== undefined) params.page = page;
        if (size !== undefined) params.size = size;
        if (date) params.date = date;
        if (status) params.status = status;

        const res = await api.get('/admin/bookings', { params });
        return res.data;
    },
    getServiceBookings: async (serviceId: number, date: string): Promise<any> => {
        const res = await api.get(`/admin/service/${serviceId}/bookings`, { params: { date } });
        return res.data;
    },
    createManualBooking: async (data: any): Promise<any> => {
        const res = await api.post('/admin/booking/manual', data);
        return res.data;
    },
    updateBookingStatus: async (bookingId: number, status: string, reason?: string): Promise<any> => {
        const res = await api.post(`/admin/booking/${bookingId}/status`, { status, reason });
        return res.data;
    },
    updateAttendanceStatus: async (bookingId: number, attendanceStatus: string): Promise<any> => {
        const res = await api.post(`/admin/booking/${bookingId}/attendance`, { attendanceStatus });
        return res.data;
    },
    rescheduleBooking: async (bookingId: number, data: any): Promise<any> => {
        const res = await api.post(`/admin/booking/${bookingId}/reschedule`, data);
        return res.data;
    },
    completeBooking: async (bookingId: number): Promise<any> => {
        const res = await api.put(`/admin/bookings/${bookingId}/complete`);
        return res.data;
    },

    // Services
    getServices: async (page: number = 0, size: number = 10): Promise<PaginatedResponse<Service>> => {
        const res = await api.get('/admin/services', { params: { pageNo: page, pageSize: size } });
        return res.data;
    },
    getAdminServices: async (managerId: number): Promise<Service[]> => {
        const res = await api.get(`/admin/manager/${managerId}/services`);
        return res.data;
    },
    deleteService: async (serviceId: number): Promise<any> => {
        const res = await api.delete(`/admin/service/${serviceId}`);
        return res.data;
    },
    setServiceAvailable: async (serviceId: string): Promise<any> => {
        const res = await api.post(`/admin/service/${serviceId}/available`);
        return res.data;
    },
    setServiceNotAvailable: async (serviceId: string): Promise<any> => {
        const res = await api.post(`/admin/service/${serviceId}/not-available`);
        return res.data;
    },

    // Slots
    getServiceSlots: async (serviceId: string): Promise<any> => {
        const res = await api.get(`/admin/service/${serviceId}/slots`);
        return res.data;
    },
    getSlotStatus: async (serviceId: string, date: string): Promise<any> => {
        const res = await api.get(`/admin/service/${serviceId}/slot-status`, { params: { date } });
        return res.data;
    },
    updateSlotPrice: async (serviceId: string, slotId: number, price: number): Promise<any> => {
        const res = await api.post(`/admin/service/${serviceId}/slot/${slotId}/price`, null, { params: { price } });
        return res.data;
    },
    enableSlot: async (serviceId: string, slotId: number): Promise<any> => {
        const res = await api.post(`/admin/service/${serviceId}/slot/${slotId}/enable`);
        return res.data;
    },
    disableSlot: async (serviceId: string, slotId: number): Promise<any> => {
        const res = await api.post(`/admin/service/${serviceId}/slot/${slotId}/disable`);
        return res.data;
    },
    disableSlotForDate: async (data: any): Promise<any> => {
        const res = await api.post('/admin/service/slot/disable-date', data);
        return res.data;
    },

    updateServiceProfile: async (serviceId: string | number, data: any): Promise<any> => {
        const res = await api.patch(`/admin/service/${serviceId}/profile`, data);
        return res.data;
    },

    setServiceApproval: async (serviceId: string | number, status: 'APPROVED' | 'REJECTED'): Promise<any> => {
        const res = await api.patch(`/admin/service/${serviceId}/approval`, { status });
        return res.data;
    },

    getAnalyticsSummary: async (): Promise<any> => {
        const res = await api.get('/admin/analytics/summary');
        return res.data;
    },

    // Users
    getUsers: async (page: number, size: number): Promise<any> => {
        const res = await api.get('/admin/users', { params: { page, size } });
        return res.data;
    },
};

export const serviceAPI = adminAPI;

export { api };
export default {
    ...api,
    auth: authAPI,
    admin: adminAPI,
};
