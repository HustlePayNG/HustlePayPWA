import { supabase } from './supabase';
import type { Booking, ArtisanProfile } from './mockDb';

export const supabaseDb = {
  // ── 1. PROFILES ──────────────────────────────────────────────────
  async getProfile(userId: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    if (error) throw error;
    return data;
  },

  async updateProfile(userId: string, updates: Partial<ArtisanProfile>) {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async getArtisans(category?: string, query?: string) {
    let req = supabase.from('profiles').select('*').eq('is_artisan', true);
    if (category && category !== 'all') {
      req = req.eq('category_id', category);
    }
    if (query) {
      req = req.or(`full_name.ilike.%${query}%,business_name.ilike.%${query}%,bio.ilike.%${query}%`);
    }
    const { data, error } = await req;
    if (error) throw error;
    return data || [];
  },

  async becomeArtisan(onboardingData: {
    businessName: string;
    categoryId: string;
    bio: string;
    yearsExperience: number;
    baseRate: number;
    calloutFee: number;
    rateType: string;
    kycDocuments: Record<string, string>;
  }) {
    const { data, error } = await supabase.rpc('become_artisan', {
      p_business_name: onboardingData.businessName,
      p_category_id: onboardingData.categoryId,
      p_bio: onboardingData.bio,
      p_years_experience: onboardingData.yearsExperience,
      p_base_rate: onboardingData.baseRate,
      p_callout_fee: onboardingData.calloutFee,
      p_rate_type: onboardingData.rateType,
      p_kyc_documents: onboardingData.kycDocuments
    });
    if (error) throw error;
    return data;
  },

  // ── 2. WALLET & TRANSACTIONS ──────────────────────────────────────
  async getWallet(userId: string) {
    const { data, error } = await supabase
      .from('wallets')
      .select('*')
      .eq('user_id', userId)
      .single();
    if (error) throw error;
    return data;
  },

  async creditWallet(userId: string, amount: number, description: string, reference?: string) {
    const ref = reference || `TX-${Date.now()}`;
    const { data: wallet } = await supabase
      .from('wallets')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (wallet) {
      const newBal = (wallet.balance || 0) + amount;
      await supabase.from('wallets').update({ balance: newBal }).eq('id', wallet.id);
    }

    const { data, error } = await supabase
      .from('transactions')
      .insert({
        user_id: userId,
        wallet_id: wallet?.id,
        type: 'credit',
        category: 'wallet_topup',
        amount,
        reference: ref,
        description,
        status: 'completed'
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async deductWallet(userId: string, amount: number, description: string, reference?: string) {
    const ref = reference || `TX-${Date.now()}`;
    const { data: wallet } = await supabase
      .from('wallets')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (wallet) {
      const newBal = Math.max(0, (wallet.balance || 0) - amount);
      await supabase.from('wallets').update({ balance: newBal }).eq('id', wallet.id);
    }

    const { data, error } = await supabase
      .from('transactions')
      .insert({
        user_id: userId,
        wallet_id: wallet?.id,
        type: 'debit',
        category: 'withdrawal',
        amount,
        reference: ref,
        description,
        status: 'completed'
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async getTransactions(userId: string) {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  // ── 3. BOOKINGS ───────────────────────────────────────────────────
  async createBooking(bookingData: {
    seekerId: string;
    artisanId: string;
    serviceName: string;
    categoryId: string;
    calloutFee: number;
    estimatedAmount: number;
    address: string;
    description?: string;
  }) {
    const ref = `HP-BK-${Math.floor(100000 + Math.random() * 900000)}`;
    const { data, error } = await supabase
      .from('bookings')
      .insert({
        reference: ref,
        seeker_id: bookingData.seekerId,
        artisan_id: bookingData.artisanId,
        service_name: bookingData.serviceName,
        category_id: bookingData.categoryId,
        callout_fee: bookingData.calloutFee,
        estimated_amount: bookingData.estimatedAmount,
        address: bookingData.address,
        description: bookingData.description,
        status: 'requested'
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async getBookings(userId: string, isArtisan: boolean) {
    const field = isArtisan ? 'artisan_id' : 'seeker_id';
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .eq(field, userId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async updateBookingStatus(bookingId: string, status: Booking['status'], extra?: any) {
    const { data, error } = await supabase
      .from('bookings')
      .update({ status, ...extra, updated_at: new Date().toISOString() })
      .eq('id', bookingId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  // ── 4. MARKETPLACE JOBS ───────────────────────────────────────────
  async createJobOpening(jobData: {
    seekerId: string;
    seekerName: string;
    title: string;
    category: string;
    categoryId: string;
    description: string;
    budget: number;
    address: string;
  }) {
    const { data, error } = await supabase
      .from('marketplace_jobs')
      .insert({
        seeker_id: jobData.seekerId,
        seeker_name: jobData.seekerName,
        title: jobData.title,
        category: jobData.category,
        category_id: jobData.categoryId,
        description: jobData.description,
        budget: jobData.budget,
        address: jobData.address,
        status: 'open'
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async getMarketplaceJobs() {
    const { data, error } = await supabase
      .from('marketplace_jobs')
      .select('*, proposals:job_proposals(*)')
      .eq('status', 'open')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async submitProposal(jobId: string, artisanId: string, artisanName: string, artisanAvatar: string, bidPrice: number, coverNote: string) {
    const { data, error } = await supabase
      .from('job_proposals')
      .insert({
        job_id: jobId,
        artisan_id: artisanId,
        artisan_name: artisanName,
        artisan_avatar: artisanAvatar,
        bid_price: bidPrice,
        cover_note: coverNote
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  // ── 5. SOCIAL FEED POSTS ──────────────────────────────────────────
  async getPosts() {
    const { data, error } = await supabase
      .from('artisan_posts')
      .select('*, comments:post_comments(*)')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async addComment(postId: string, userId: string, userName: string, userAvatar: string, body: string) {
    const { data, error } = await supabase
      .from('post_comments')
      .insert({
        post_id: postId,
        user_id: userId,
        user_name: userName,
        user_avatar: userAvatar,
        body
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  // ── 6. DISPUTES ───────────────────────────────────────────────────
  async createDispute(disputeData: {
    bookingId: string;
    bookingRef: string;
    complainantId: string;
    respondentId: string;
    reason: string;
    description: string;
    evidenceUrls?: string[];
  }) {
    const { data, error } = await supabase
      .from('disputes')
      .insert({
        booking_id: disputeData.bookingId,
        booking_ref: disputeData.bookingRef,
        complainant_id: disputeData.complainantId,
        respondent_id: disputeData.respondentId,
        reason: disputeData.reason,
        description: disputeData.description,
        evidence_urls: disputeData.evidenceUrls || [],
        status: 'open'
      })
      .select()
      .single();

    if (error) throw error;

    // Update booking status to disputed
    await supabase
      .from('bookings')
      .update({ status: 'disputed', updated_at: new Date().toISOString() })
      .eq('id', disputeData.bookingId);

    return data;
  },

  async getDisputes(userId: string) {
    const { data, error } = await supabase
      .from('disputes')
      .select('*')
      .or(`complainant_id.eq.${userId},respondent_id.eq.${userId}`)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async resolveDispute(disputeId: string, resolutionOutcome: string, refundAmount?: number) {
    const { data, error } = await supabase
      .from('disputes')
      .update({
        status: 'resolved',
        resolution_outcome: resolutionOutcome,
        refund_amount: refundAmount || 0,
        resolved_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', disputeId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // ── 7. REALTIME MESSAGING ─────────────────────────────────────────
  async sendMessage(bookingId: string, senderId: string, body: string, receiverId?: string) {
    const { data, error } = await supabase
      .from('messages')
      .insert({
        booking_id: bookingId,
        sender_id: senderId,
        receiver_id: receiverId,
        body
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async getMessages(bookingId: string) {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('booking_id', bookingId)
      .order('created_at', { ascending: true });
    if (error) throw error;
    return data || [];
  },

  subscribeToMessages(bookingId: string, onNewMessage: (msg: any) => void) {
    const channel = supabase
      .channel(`messages:${bookingId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `booking_id=eq.${bookingId}`
        },
        (payload) => {
          onNewMessage(payload.new);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }
};


