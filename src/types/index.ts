// Basic type stubs to satisfy compilation

export interface Service {
    id: string;
    name: string;
    description?: string;
    price?: number;
    duration?: number;
    isActive?: boolean;
}

export interface SlotConfig {
    id?: string;
    slotId?: string;
    price?: number;
    enabled?: boolean;
}

export interface Slot {
    slotId?: string;
    id?: string;
    startTime: string;
    endTime: string;
    price?: number;
}

export interface Booking {
    id: string;
    serviceId: string;
    userId: string;
    status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
    date: string;
    bookingDate?: string;
    createdAt?: string;
    slotTime?: string;
    slots: Slot[];
    totalAmount?: number;
    amount?: number;
    reference?: string;
    serviceName?: string;
    userName?: string;
    user?: {
        name: string;
        phone?: string;
    };
}

export interface ManagerUser {
    id: string;
    name: string;
    email?: string;
    phone?: string;
    phoneNumber?: string; // Legacy support
    role: 'admin' | 'manager';
    isActive: boolean;
    enabled?: boolean;
    wallet?: {
        balance: number;
    };
    totalBookings?: number;
    confirmedBookings?: number;
    cancelledBookings?: number;
}

export interface Admin {
    id: string;
    name: string;
}

export interface AmountBreakdown {
    slotSubtotal: number;
    platformFeePercent: number;
    platformFee: number;
    totalAmount: number;
    currency: string;
}

export interface AdminBooking {
    id: number;
    reference: string;
    serviceId: number;
    serviceName: string;
    resourceId: number;
    resourceName: string;
    startTime: string;
    endTime: string;
    bookingDate: string;
    createdAt: string;
    amountBreakdown: AmountBreakdown;
    bookingType: string;
    message: string;
    childBookings: string[];
    status: string;
    user: {
        id: number;
        name: string;
        email: string;
        phone: string;
    };
}

export interface PaginatedResponse<T> {
    content: T[];
    pageNo: number;
    pageSize: number;
    totalElements: number;
    totalPages: number;
    last: boolean;
}
