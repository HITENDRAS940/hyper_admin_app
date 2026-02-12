// Basic type stubs to satisfy compilation

export interface ArenaAmenity {
  id: string;
  name: string;
  icon: string;
  available: boolean;
}

export interface OperatingHours {
  day: string;
  open: string;
  close: string;
  isClosed: boolean;
}

export interface SportPricing {
  sport: string;
  pricePerHour: number;
}

export interface Service {
  id: string;
  name: string;
  description?: string;
  price?: number;
  duration?: number;
  isActive?: boolean;
  location?: string;
  city?: string;
  availability?: boolean;
  contactNumber?: string;
  googleMapsLink?: string;
  photos?: string[];
  sports?: string[];
  amenities?: ArenaAmenity[];
  operatingHours?: OperatingHours[];
  pricingBySport?: SportPricing[];
  cancellationPolicy?: string;
  approvalStatus?: 'PENDING' | 'APPROVED' | 'REJECTED';
  ownerId?: string;
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
  status:
  | 'pending'
  | 'confirmed'
  | 'cancelled'
  | 'completed'
  | 'PENDING'
  | 'CONFIRMED'
  | 'CANCELLED'
  | 'COMPLETED';
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
  sport?: string;
  startTime: string;
  endTime: string;
  bookingDate: string;
  createdAt: string;
  amountBreakdown: AmountBreakdown;
  bookingType: string | null;
  message: string | null;
  childBookings: string[] | null;
  status: string;
  user: {
    id: number;
    name: string;
    email: string;
    phone: string;
  } | null;
  paymentStatus?: 'PAID' | 'PENDING' | 'REFUNDED';
  attendanceStatus?: 'CHECKED_IN' | 'NO_SHOW' | 'PENDING';
}

export interface PaginatedResponse<T> {
  content: T[];
  pageNo: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export interface Activity {
  id: number;
  code: string;
  name: string;
  enabled: boolean;
}

export interface Resource {
  id: number;
  serviceId: number;
  serviceName: string;
  name: string;
  description: string;
  enabled: boolean;
  activities: Activity[];
}

export interface ResourceSlot {
  slotId: string;
  startTime: string;
  endTime: string;
  displayName: string;
  durationMinutes: number;
  basePrice: number;
  totalPrice: number;
  price: number;
  status: 'AVAILABLE' | 'BOOKED' | 'DISABLED' | string;
  statusReason?: string;
  isEnabled: boolean;
  slotDate: string;
}
