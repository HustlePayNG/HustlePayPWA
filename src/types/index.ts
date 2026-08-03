export type UserRole = 'seeker' | 'artisan' | 'admin';
export type KycStatus = 'unverified' | 'pending' | 'pending_review' | 'approved' | 'rejected';
export type BookingStatus =
  | 'requested'
  | 'accepted'
  | 'in_progress'
  | 'assessment_submitted'
  | 'price_proposed'
  | 'price_accepted'
  | 'seeker_confirmed'
  | 'funded'
  | 'disputed'
  | 'completed'
  | 'declined'
  | 'cancelled';

export interface UserAddress {
  formattedAddress: string;
  latitude: number;
  longitude: number;
}

export interface User {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  avatarUrl?: string;
  role: UserRole;
  activeModePreference: 'seeker' | 'artisan';
  address?: UserAddress;
  kycStatus: KycStatus;
  kycDocuments?: {
    government_id?: string;
    skill_certificate?: string;
    passport_photo?: string;
  };
  businessName?: string;
  categoryId?: string;
  bio?: string;
  yearsExperience?: number;
  baseRate?: number;
  calloutFee?: number;
  rateType?: 'hourly' | 'fixed';
  rating?: number;
  ratingAverage?: number;
  ratingCount?: number;
  distanceKm?: number;
  completedJobsCount?: number;
  verifiedBadge?: boolean;
  lastReminderSentAt?: string;
  rejectionReason?: string;
  createdAt: string;
}

export interface ArtisanService {
  id: string;
  name: string;
  price: number;
  description?: string;
}

export interface ArtisanProfile extends User {
  businessName: string;
  categoryId: string;
  bio: string;
  yearsExperience: number;
  baseRate: number;
  calloutFee: number;
  rateType: 'hourly' | 'fixed';
  rating: number;
  ratingAverage: number;
  ratingCount: number;
  distanceKm: number;
  completedJobsCount: number;
  verifiedBadge: boolean;
  availability?: any[];
  services?: ArtisanService[];
  pricing?: {
    rateType: 'hourly' | 'fixed';
    baseRate: number;
    calloutFee: number;
  };
}

export interface PostComment {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  body: string;
  createdAt: string;
}

export interface ArtisanPost {
  id: string;
  artisanId: string;
  artisanName: string;
  artisanAvatar: string;
  artisanCategory: string;
  artisanOccupation?: string;
  caption?: string;
  category?: string;
  verifiedBadge?: boolean;
  title: string;
  description: string;
  imageUrl?: string;
  mediaUrls: string[];
  likesCount: number;
  commentsCount: number;
  likedByMe?: boolean;
  comments?: PostComment[];
  createdAt: string;
}

export interface BookingAssessment {
  notes: string;
  proposedLaborCost: number;
  materialsCost?: number;
  photos?: string[];
  submittedAt: string;
}

export interface Booking {
  id: string;
  reference?: string;
  seekerId: string;
  artisanId: string;
  seekerName?: string;
  seekerPhone?: string;
  artisanName?: string;
  artisanAvatar?: string;
  artisanCategory?: string;
  serviceName?: string;
  serviceDescription?: string;
  address?: UserAddress | string;
  scheduledDate?: string;
  scheduledTime?: string;
  scheduledStartAt?: string;
  calloutFeePaid?: number;
  calloutFee?: number;
  estimatedAmount?: number;
  finalAmount?: number;
  escrowAmount?: number;
  totalAmount?: number;
  description?: string;
  photos?: string[];
  status: BookingStatus;
  assessment?: BookingAssessment;
  createdAt: string;
  updatedAt?: string;
}

export interface Transaction {
  id: string;
  walletId?: string;
  userId: string;
  type: 'credit' | 'debit';
  direction?: 'credit' | 'debit';
  category?: 'wallet_topup' | 'callout_payment' | 'service_payment' | 'escrow_payout' | 'dispute_refund' | 'withdrawal' | 'commission';
  amount: number;
  reference: string;
  description: string;
  status: 'pending' | 'completed' | 'failed';
  bookingId?: string;
  createdAt: string;
}

export interface Wallet {
  id: string;
  userId: string;
  balance: number;
  currency: string;
  escrowBalance: number;
  transactions: Transaction[];
  updatedAt: string;
}

export interface Message {
  id: string;
  bookingId: string;
  senderId: string;
  text: string;
  body?: string;
  mediaUrl?: string;
  read: boolean;
  createdAt: string;
}

export interface Dispute {
  id: string;
  reference?: string;
  bookingRef?: string;
  bookingId: string;
  openedByUserId?: string;
  raisedByUserId: string;
  reason: string;
  description: string;
  evidenceUrls: string[];
  status: 'open' | 'under_review' | 'resolved' | 'rejected';
  resolution?: string;
  resolutionNotes?: string;
  refundPercentage?: number;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  body?: string;
  read: boolean;
  type: 'booking' | 'payment' | 'dispute' | 'system' | 'kyc';
  actionUrl?: string;
  createdAt: string;
}
