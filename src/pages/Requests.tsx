import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store';
import { mockDb, type Booking } from '../services/mockDb';
import { MessageText, Calendar, Star, Danger } from 'iconsax-react';
import { Button, TextArea, Select, SelectTrigger, SelectValue, SelectPopover, ListBox, ListBoxItem, Modal, ModalBackdrop, ModalContainer, ModalDialog, ModalBody, ModalHeader, ModalFooter, Spinner, toast } from '@heroui/react';

export const Requests: React.FC = () => {
  const navigate = useNavigate();
  const { user, bookings, refreshBookings, refreshWallet } = useAppStore();

  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  
  // Review Modal State
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [reviewTags, setReviewTags] = useState<string[]>([]);
  const [submittingReview, setSubmittingReview] = useState(false);

  // Dispute Modal State
  const [showDisputeModal, setShowDisputeModal] = useState(false);
  const [disputeReason, setDisputeReason] = useState('Poor service quality');
  const [disputeDesc, setDisputeDesc] = useState('');
  const [submittingDispute, setSubmittingDispute] = useState(false);

  useEffect(() => {
    refreshBookings();
  }, []);

  if (!user) return null;

  const handleOpenDetails = (bk: Booking) => {
    setSelectedBooking(bk);
  };

  const handleCloseDetails = () => {
    setSelectedBooking(null);
  };

  const handleAcceptPrice = (bk: Booking) => {
    const finalAmt = bk.finalAmount || bk.estimatedAmount;
    const remaining = finalAmt; 
    
    try {
      mockDb.deductWallet(user.id, remaining, `Remaining balance for ${bk.serviceName} (${bk.reference})`, bk.reference);
      mockDb.updateBookingStatus(bk.id, 'price_accepted', { finalAmount: finalAmt });
      refreshBookings();
      refreshWallet();
      
      const updated = mockDb.getBookingById(bk.id);
      if (updated) setSelectedBooking(updated);
      
      toast.success('Remaining balance paid successfully! Artisan can now mark the job complete.');
    } catch (e: any) {
      toast.danger(`Insufficient funds. Your wallet balance is too low to pay the remaining balance of ₦${remaining.toLocaleString()}. Please top up.`);
      navigate('/wallet');
    }
  };

  const handleConfirmCompletion = (bk: Booking) => {
    mockDb.updateBookingStatus(bk.id, 'seeker_confirmed');
    refreshBookings();
    
    const updated = mockDb.getBookingById(bk.id);
    if (updated) setSelectedBooking(updated);

    setShowReviewModal(true);
  };

  const toggleTag = (tag: string) => {
    if (reviewTags.includes(tag)) {
      setReviewTags(reviewTags.filter(t => t !== tag));
    } else {
      setReviewTags([...reviewTags, tag]);
    }
  };

  const submitReview = () => {
    if (!selectedBooking) return;
    setSubmittingReview(true);
    setTimeout(() => {
      mockDb.addReview(
        selectedBooking.id,
        user.id,
        rating,
        reviewText,
        reviewTags
      );
      setSubmittingReview(false);
      setShowReviewModal(false);
      setReviewText('');
      setReviewTags([]);
      
      refreshBookings();
      handleCloseDetails();
      toast.success('Thank you for rating your service!');
    }, 1000);
  };

  const handleFileDispute = () => {
    if (!selectedBooking) return;
    setSubmittingDispute(true);
    setTimeout(() => {
      mockDb.createDispute(
        selectedBooking.id,
        user.id,
        disputeReason,
        disputeDesc,
        []
      );
      setSubmittingDispute(false);
      setShowDisputeModal(false);
      setDisputeDesc('');
      
      refreshBookings();
      handleCloseDetails();
      toast.success('Dispute raised successfully. An operations admin will review the logs.');
    }, 1000);
  };

  const getStatusColor = (status: Booking['status']) => {
    switch (status) {
      case 'requested': return 'bg-blue-500/10 text-blue-400 border border-blue-500/20';
      case 'accepted': return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
      case 'in_progress': return 'bg-brand-500/10 text-brand-300 border border-brand-500/20';
      case 'price_proposed': return 'bg-purple-500/10 text-purple-400 border border-purple-500/20';
      case 'price_accepted': return 'bg-pink-500/10 text-pink-400 border border-pink-500/20';
      case 'completed': return 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20';
      case 'seeker_confirmed': return 'bg-success-500/10 text-success-400 border border-success-500/20';
      case 'cancelled': return 'bg-zinc-800 text-zinc-500 border border-zinc-700/50';
      case 'disputed': return 'bg-danger-500/10 text-danger-400 border border-danger-500/20';
      default: return 'bg-zinc-800 text-zinc-550';
    }
  };

  const formatStatus = (status: Booking['status']) => {
    if (status === 'price_proposed') return 'Price Proposed';
    if (status === 'price_accepted') return 'Price Paid (Pending Completion)';
    if (status === 'seeker_confirmed') return 'Completed & Confirmed';
    return status;
  };

  return (
    <div className="flex flex-col text-left w-full">
      <h3 className="text-xs uppercase font-bold text-zinc-400 tracking-wider mb-4">My Service Requests</h3>
      
      <div className="flex flex-col gap-4">
        {bookings.length === 0 ? (
          <div className="glass border border-zinc-900 rounded-3xl p-12 text-center text-zinc-500 text-xs">
            No booking requests made yet. Browse the home tab to hire artisans.
          </div>
        ) : (
          bookings.map(bk => (
            <div 
              key={bk.id} 
              className="glass border border-zinc-850 hover:border-zinc-750 transition-all rounded-[28px] cursor-pointer p-4 flex flex-row items-center gap-4 animate-in fade-in"
              onClick={() => handleOpenDetails(bk)}
            >
              <img src={bk.artisanAvatar} className="h-12 w-12 border border-zinc-800 rounded-2xl object-cover shrink-0" alt="" />
              
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start gap-2">
                  <span className="font-extrabold text-xs text-white block truncate">{bk.artisanName}</span>
                  <span className={`text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider font-semibold ${getStatusColor(bk.status)}`}>
                    {formatStatus(bk.status)}
                  </span>
                </div>
                
                <span className="text-[10px] text-zinc-400 block mt-0.5">{bk.serviceName}</span>
                <div className="flex items-center justify-between mt-3 text-[10px] text-zinc-500">
                  <div className="flex items-center gap-1 font-semibold text-zinc-400">
                    <Calendar size={10} color="currentColor" variant="Broken" className="text-brand-400" />
                    <span>{new Date(bk.createdAt).toLocaleDateString()}</span>
                  </div>
                  <span className="font-bold text-white">₦{(bk.finalAmount || bk.estimatedAmount).toLocaleString()}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <Modal isOpen={!!selectedBooking} onOpenChange={(open) => { if (!open) handleCloseDetails(); }}>
        <ModalBackdrop className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end justify-center">
          <ModalContainer className="w-full max-w-md bg-zinc-950 border-t border-zinc-800 rounded-t-[32px] p-4 max-h-[90svh] overflow-y-auto text-white">
            <ModalDialog className="outline-none">
              {selectedBooking && (
                <>
                  <ModalHeader className="flex flex-col gap-1 text-left">
                    <div className="flex justify-between items-start pr-4 mt-2">
                      <div>
                        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block">Reference: {selectedBooking.reference}</span>
                        <h3 className="text-lg font-extrabold text-white mt-1">{selectedBooking.serviceName}</h3>
                      </div>
                      <span className={`text-[9px] px-2.5 py-1 rounded-full uppercase tracking-wider font-bold shrink-0 ${getStatusColor(selectedBooking.status)}`}>
                        {formatStatus(selectedBooking.status)}
                      </span>
                    </div>
                  </ModalHeader>
                  <ModalBody className="pb-6">
                    <div className="flex items-center gap-3 p-3 rounded-2xl bg-zinc-900/30 border border-zinc-850 mb-4">
                      <img src={selectedBooking.artisanAvatar} className="h-10 w-10 rounded-xl border border-zinc-800 object-cover shrink-0" alt="" />
                      <div className="text-left flex-1 min-w-0">
                        <span className="font-bold text-xs text-white block">{selectedBooking.artisanName}</span>
                        <span className="text-[10px] text-zinc-500 block">Artisan Provider</span>
                      </div>
                      <Button
                        className="px-3.5 py-2 bg-transparent border border-zinc-800 hover:bg-zinc-900 rounded-xl text-xs font-bold text-brand-400 flex items-center gap-1.5 transition-all h-8"
                        onClick={() => {
                          handleCloseDetails();
                          navigate(`/chat/${selectedBooking.id}`);
                        }}
                      >
                        <MessageText size={14} color="currentColor" variant="Broken" />
                        <span>Chat</span>
                      </Button>
                    </div>

                    <div className="mb-4 flex flex-col gap-4 text-xs">
                      <div className="text-left">
                        <span className="font-bold text-[10px] text-zinc-500 uppercase tracking-wider block mb-1">Issue Details</span>
                        <p className="text-zinc-300 bg-zinc-900/40 border border-zinc-850/60 rounded-xl p-3 leading-relaxed font-light">
                          {selectedBooking.description}
                        </p>
                      </div>

                      {selectedBooking.photos.length > 0 && (
                        <div className="text-left">
                          <span className="font-bold text-[10px] text-zinc-500 uppercase tracking-wider block mb-2">Attached Photos</span>
                          <div className="flex gap-2 flex-wrap">
                            {selectedBooking.photos.map((ph, i) => (
                              <img key={i} src={ph} className="h-14 w-14 rounded-lg object-cover border border-zinc-850" alt="" />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="mb-4 flex flex-col gap-3">
                      {selectedBooking.status === 'price_proposed' && (
                        <div className="glass border border-purple-500/20 bg-purple-500/5 p-4 rounded-2xl flex flex-col gap-3">
                          <span className="text-xs font-bold text-purple-300 flex items-center gap-1.5">
                            Action Required: Confirm Final Price
                          </span>
                          <p className="text-[11px] text-zinc-300 leading-normal font-light text-left">
                            The artisan has proposed a service fee of <span className="font-extrabold text-white">₦{selectedBooking.finalAmount?.toLocaleString()}</span>. 
                            Deducting the call-out fee (₦{selectedBooking.calloutFee.toLocaleString()}), the remaining balance is:
                          </p>
                          <div className="flex justify-between items-center text-xs bg-zinc-900/60 p-2.5 rounded-lg font-bold">
                            <span className="text-zinc-400">Total remaining balance:</span>
                            <span className="text-brand-300">₦{((selectedBooking.finalAmount || 0) - selectedBooking.calloutFee).toLocaleString()}</span>
                          </div>
                          <Button
                            className="w-full font-bold bg-brand-500 hover:bg-brand-650 h-11 rounded-xl text-white transition-all text-xs"
                            onClick={() => handleAcceptPrice(selectedBooking)}
                          >
                            Pay Balance & Authorize Job
                          </Button>
                        </div>
                      )}

                      {selectedBooking.status === 'completed' && (
                        <div className="glass border border-cyan-500/20 bg-cyan-500/5 p-4 rounded-2xl flex flex-col gap-3">
                          <span className="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
                            Job Completed
                          </span>
                          <p className="text-[11px] text-zinc-300 leading-normal font-light text-left">
                            Artisan completed the job. Confirm completion to release payout funds.
                          </p>
                          <Button
                            className="w-full font-bold text-white bg-success-500 hover:bg-success-650 h-11 rounded-xl transition-all text-xs"
                            onClick={() => handleConfirmCompletion(selectedBooking)}
                          >
                            Confirm Job Completion
                          </Button>
                        </div>
                      )}

                      {['accepted', 'in_progress', 'price_proposed', 'price_accepted', 'completed'].includes(selectedBooking.status) && (
                        <Button
                          className="w-full font-semibold border border-danger-500/20 text-danger hover:bg-danger/10 h-11 rounded-xl text-xs transition-all gap-1.5 bg-transparent flex items-center justify-center"
                          onClick={() => setShowDisputeModal(true)}
                        >
                          <Danger size={14} color="currentColor" variant="Broken" />
                          <span>File a Dispute</span>
                        </Button>
                      )}
                    </div>
                  </ModalBody>
                  <ModalFooter>
                    <Button
                      className="w-full border border-zinc-800 text-zinc-400 font-bold h-11 rounded-xl text-xs hover:bg-zinc-900 transition-colors bg-transparent"
                      onClick={handleCloseDetails}
                    >
                      Close Details
                    </Button>
                  </ModalFooter>
                </>
              )}
            </ModalDialog>
          </ModalContainer>
        </ModalBackdrop>
      </Modal>

      <Modal isOpen={showReviewModal} onOpenChange={setShowReviewModal}>
        <ModalBackdrop className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <ModalContainer className="bg-zinc-950 border border-zinc-800 max-w-sm w-full rounded-[28px] p-6 text-white overflow-hidden max-h-[90svh] overflow-y-auto">
            <ModalDialog className="outline-none">
              <ModalHeader className="flex flex-col gap-1 text-center items-center">
                <span className="text-xs uppercase font-extrabold tracking-widest text-brand-400 mt-2">Feedback</span>
                <h3 className="text-lg font-extrabold text-white">Rate Your Artisan</h3>
              </ModalHeader>
              <ModalBody className="flex flex-col gap-4 text-center items-center">
                <p className="text-xs text-zinc-400 leading-normal font-light">
                  How would you rate the service received from {selectedBooking?.artisanName}?
                </p>

                <div className="flex gap-1.5 justify-center py-2">
                  {[1, 2, 3, 4, 5].map(stars => (
                    <button
                      key={stars}
                      type="button"
                      onClick={() => setRating(stars)}
                      className="p-1 hover:scale-110 transition-transform"
                    >
                      <Star 
                        size={28} 
                        color="currentColor"
                        variant="Broken"
                        className={stars <= rating ? 'text-warning-400 fill-warning-400' : 'text-zinc-700'} 
                      />
                    </button>
                  ))}
                </div>

                <div className="flex flex-wrap gap-1.5 justify-center py-1">
                  {['punctual', 'professional', 'tidy_work', 'fair_price', 'skilled', 'friendly'].map(tag => {
                    const isSelected = reviewTags.includes(tag);
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => toggleTag(tag)}
                        className={`text-[9px] uppercase tracking-wider font-bold px-2.5 py-1 rounded-full border transition-all ${isSelected ? 'bg-brand-500 border-brand-400 text-white' : 'glass border-zinc-800 text-zinc-400 bg-transparent'}`}
                      >
                        {tag.replace('_', ' ')}
                      </button>
                    );
                  })}
                </div>

                <TextArea
                  placeholder="Share your detailed review of the work..."
                  value={reviewText}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setReviewText(e.target.value)}
                  className="w-full text-xs text-white bg-zinc-900 border border-zinc-850 rounded-xl p-3.5 focus:border-brand-500 outline-none min-h-[70px]"
                />
              </ModalBody>
              <ModalFooter className="flex flex-col gap-2 pb-6">
                <Button
                  className="w-full h-11 font-bold bg-brand-500 hover:bg-brand-600 rounded-xl text-white transition-all text-xs flex items-center justify-center gap-2"
                  onClick={submitReview}
                  isDisabled={submittingReview}
                >
                  {submittingReview && <Spinner size="sm" />}
                  Submit Review
                </Button>
              </ModalFooter>
            </ModalDialog>
          </ModalContainer>
        </ModalBackdrop>
      </Modal>

      <Modal isOpen={showDisputeModal} onOpenChange={setShowDisputeModal}>
        <ModalBackdrop className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <ModalContainer className="bg-zinc-950 border border-zinc-800 max-w-sm w-full rounded-[28px] p-6 text-white overflow-hidden max-h-[90svh] overflow-y-auto">
            <ModalDialog className="outline-none">
              <ModalHeader className="flex flex-col gap-1 text-left pr-4 mt-2">
                <span className="text-xs uppercase font-extrabold tracking-widest text-danger-400">File dispute</span>
                <h3 className="text-lg font-extrabold text-white">Open Dispute</h3>
              </ModalHeader>
              <ModalBody className="flex flex-col gap-4 text-left">
                <p className="text-xs text-zinc-400 leading-normal font-light">
                  A dispute locks the booking and alerts admins to manually mediate this request.
                </p>

                <div className="flex flex-col gap-1.5">
                  <label className="text-zinc-400 text-xs font-semibold">Select Reason</label>
                  <Select selectedKey={disputeReason} onSelectionChange={(key) => setDisputeReason(key as string)}>
                    <SelectTrigger className="w-full bg-zinc-900 border border-zinc-850 rounded-xl p-3 text-xs text-white flex justify-between items-center">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectPopover className="bg-zinc-950 border border-zinc-850 rounded-xl p-1 text-white z-50">
                      <ListBox className="outline-none">
                        <ListBoxItem id="Poor service quality" textValue="Poor service quality" className="p-2 text-xs text-zinc-300 hover:text-white hover:bg-brand-500 rounded-lg cursor-pointer outline-none">Poor service quality</ListBoxItem>
                        <ListBoxItem id="Incomplete work" textValue="Incomplete work" className="p-2 text-xs text-zinc-300 hover:text-white hover:bg-brand-500 rounded-lg cursor-pointer outline-none">Incomplete work</ListBoxItem>
                        <ListBoxItem id="Artisan absent / no show" textValue="Artisan absent / no show" className="p-2 text-xs text-zinc-300 hover:text-white hover:bg-brand-500 rounded-lg cursor-pointer outline-none">Artisan absent / no show</ListBoxItem>
                        <ListBoxItem id="Overcharged price disagreement" textValue="Overcharged price disagreement" className="p-2 text-xs text-zinc-300 hover:text-white hover:bg-brand-500 rounded-lg cursor-pointer outline-none">Overcharged price disagreement</ListBoxItem>
                      </ListBox>
                    </SelectPopover>
                  </Select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <span className="text-zinc-400 text-xs font-semibold">Detailed Description</span>
                  <TextArea
                    placeholder="Explain the issue clearly. You can upload photos to back your claim..."
                    value={disputeDesc}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDisputeDesc(e.target.value)}
                    className="w-full text-xs text-white bg-zinc-900 border border-zinc-850 rounded-xl p-3.5 focus:border-brand-500 outline-none min-h-[90px]"
                  />
                </div>
              </ModalBody>
              <ModalFooter className="flex gap-3 pb-6">
                <Button
                  className="flex-1 h-11 border border-zinc-800 text-zinc-400 font-bold rounded-xl hover:bg-zinc-900 transition-all bg-transparent"
                  onClick={() => setShowDisputeModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1 h-11 font-bold bg-danger hover:bg-danger/80 text-white rounded-xl transition-all flex items-center justify-center gap-2"
                  onClick={handleFileDispute}
                  isDisabled={submittingDispute || !disputeDesc}
                >
                  {submittingDispute && <Spinner size="sm" />}
                  File Dispute
                </Button>
              </ModalFooter>
            </ModalDialog>
          </ModalContainer>
        </ModalBackdrop>
      </Modal>

    </div>
  );
};

export default Requests;
