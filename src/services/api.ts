import { Service, Booking, ManagerUser, AdminBooking, PaginatedResponse } from '../types';

// Mock data
const services: Service[] = [
    { id: '1', name: 'Service 1', price: 100, duration: 60, isActive: true },
    { id: '2', name: 'Service 2', price: 200, duration: 90, isActive: true },
];

const bookings: Booking[] = [
    { id: '1', serviceId: '1', userId: 'user1', status: 'confirmed', date: '2023-01-01', slots: [], totalAmount: 100 },
];

const users: ManagerUser[] = [
    { id: '1', name: 'User 1', role: 'manager', isActive: true, wallet: { balance: 0 }, totalBookings: 0, confirmedBookings: 0, cancelledBookings: 0, phone: '123' },
];

// Axios-like wrapper
const response = (data: any) => ({ data });

const BASE_URL = 'http://localhost:5000';

const formatPhoneNumber = (phone: string) => {
    const cleaned = phone.replace(/\D/g, '');
    return cleaned.startsWith('91') && cleaned.length > 10 ? `+${cleaned}` : `+91${cleaned}`;
};

let authToken: string | null = null;

export const setAuthToken = (token: string | null) => {
    authToken = token;
};

export const adminAPI = {
    getServices: async (): Promise<any> => response(services),
    getAdminServices: async (adminId: string): Promise<any> => response(services),
    getServiceById: async (id: string): Promise<Service | undefined> => services.find(s => s.id === id),
    getServiceBookings: async (id: string, date: string) => [],
    getServiceSlots: async (id: string) => response([]),
    getBookings: async (): Promise<any> => response(bookings),
    getAllBookings: async (): Promise<any> => response(bookings),
    getUsers: async (page: number, limit: number): Promise<any> =>
        response({ content: users, last: true }),

    getAdminBookings: async (page: number, size: number): Promise<PaginatedResponse<AdminBooking>> => {
        const queryParams = new URLSearchParams({
            page: page.toString(),
            size: size.toString()
        });
        const url = `${BASE_URL}/admin/bookings?${queryParams}`;
        console.log('Fetching admin bookings from:', url);
        const res = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                ...(authToken ? { 'Authorization': `Bearer ${authToken}` } : {})
            },
        });
        if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            throw new Error(errorData.message || 'Failed to fetch admin bookings');
        }
        return res.json();
    },

    setServiceAvailable: async (id: string) => { },
    setServiceNotAvailable: async (id: string) => { },
    deleteService: async (id: string) => { },
    disableSlotForDate: async (data: any) => { },
    createManualBooking: async (data: any) => { },
    updateSlotPrice: async (sId: string, slotId: string, price: number) => { },
    enableSlot: async (sId: string, slotId: string) => { },
    disableSlot: async (sId: string, slotId: string) => { },

    // Auth
    requestOtp: async (phone: string): Promise<void> => {
        const formattedPhone = formatPhoneNumber(phone);
        const res = await fetch(`${BASE_URL}/auth/request-otp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone: formattedPhone }),
        });
        if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            throw new Error(errorData.message || 'Failed to request OTP');
        }
    },
    verifyOtp: async (phone: string, otp: string): Promise<{ token: string }> => {
        const formattedPhone = formatPhoneNumber(phone);
        const res = await fetch(`${BASE_URL}/auth/verify-otp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone: formattedPhone, otp }),
        });
        if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            throw new Error(errorData.message || 'Failed to verify OTP');
        }
        return res.json();
    },
};

export const serviceAPI = adminAPI;
