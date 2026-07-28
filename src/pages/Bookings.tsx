import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store';
import { mockDb, type Booking } from '../services/mockDb';
import { Calendar, MessageText, Money } from 'iconsax-react';
import { Button, TextField, Label, Input, Modal, ModalBackdrop, ModalContainer, ModalDialog, ModalBody, ModalHeader, ModalFooter, Spinner } from '@heroui/react';

export const Bookings: React.FC = () => {
  const navigate = useNavigate();
  const { user, bookings, refreshBookings } = useAppStore();

  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  
  // Status filter state
  const [filterTab, setFilterTab] = useState<'all' | 'requested' | 'active' | 'completed'>('all');

  // Final Price Proposal states
  const [showPriceForm, setShowPriceForm] = useState(false);
  const [proposing, setProposing] = useState(false);

  // Itemized Pricing proposal states
  const [laborCharge, setLaborCharge] = useState(12000);
  const [materialsCharge, setMaterialsCharge] = useState(3000);

  useEffect(() => {
    refreshBookings();
  }, []);

  if (!user) return null;

  const filterBookings = (list: Booking[]) => {
    if (filterTab === 'requested') return list.filter(b => b.status === 'requested');
    if (filterTab === 'active') return list.filter(b => ['accepted', 'in_progress', 'price_proposed', 'price_accepted'].includes(b.status));
    if (filterTab === 'completed') return list.filter(b => ['completed', 'seeker_confirmed'].includes(b.status));
    return list;
  };

  const handleOpenDetails = (bk: Booking) => {
    setSelectedBooking(bk);
    setShowPriceForm(false);
    setLaborCharge(bk.estimatedAmount || 10000);
    setMaterialsCharge(0);
  };

  const handleCloseDetails = () => {
    setSelectedBooking(null);
  };

  const handleAccept = (bk: Booking) => {
    mockDb.updateBookingStatus(bk.id, 'accepted');
    refreshBookings();
    handleCloseDetails();
  };

  const handleDecline = (bk: Booking) => {
    mockDb.updateBookingStatus(bk.id, 'declined');
    refreshBookings();
    handleCloseDetails();
  };

  const handleStart = (bk: Booking) => {
    mockDb.updateBookingStatus(bk.id, 'in_progress');
    refreshBookings();
    handleCloseDetails();
  };

  const handleProposePrice = () => {
    if (!selectedBooking) return;
    const totalAmount = laborCharge + materialsCharge;
    setProposing(true);
    setTimeout(() => {
      mockDb.updateBookingStatus(selectedBooking.id, 'price_proposed', { finalAmount: totalAmount });
      refreshBookings();
      setProposing(false);
      setShowPriceForm(false);
      handleCloseDetails();
    }, 1200);
  };

  const handleMarkComplete = (bk: Booking) => {
    mockDb.updateBookingStatus(bk.id, 'completed');
    refreshBookings();
    handleCloseDetails();
  };

  // UI status logic
  const getStatusColor = (status: Booking['status']) => {
    switch (status) {
      case 'requested': return 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20';
      case 'accepted': return 'bg-blue-500/10 text-blue-400 border border-blue-500/20';
      case 'in_progress': return 'bg-orange-500/10 text-orange-400 border border-orange-500/20';
      case 'price_proposed': return 'bg-purple-500/10 text-purple-400 border border-purple-500/20';
      case 'price_accepted': return 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20';
      case 'completed': return 'bg-green-500/10 text-green-400 border border-green-500/20';
      case 'declined': return 'bg-zinc-800 text-zinc-500 border border-zinc-700/50';
      case 'disputed': return 'bg-red-500/10 text-red-400 border border-red-500/20';
      default: return 'bg-zinc-800 text-zinc-400';
    }
  };

  const formatStatus = (status: Booking['status']) => {
    return status.replace('_', ' ');
  };

  // Filter based on user type (ART-15)
  const isArtisan = user.activeModePreference === 'artisan';
  const myBookings = bookings.filter(bk => 
    isArtisan ? bk.artisanId === user.id : bk.seekerId === user.id
  );
  const displayedBookings = filterBookings(myBookings);

  return (
    <div className="flex-1 flex flex-col px-4 py-6 bg-zinc-955 text-left animate-in fade-in pb-20">
      <h2 className="text-2xl font-extrabold text-white mb-2">
        {isArtisan ? 'Job Pipeline' : 'Your Bookings'}
      </h2>
      <p className="text-xs text-zinc-400 leading-relaxed mb-5 font-light">
        {isArtisan 
          ? 'Manage incoming booking offers, accept assessment tickets, and propose service fees.'
          : 'Monitor active call-outs, view estimated labor prices, and release smart escrow payouts.'
        }
      </p>

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar mb-5 py-1">
        <button
          onClick={() => setFilterTab('all')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all border shrink-0 cursor-pointer ${
            filterTab === 'all'
              ? 'bg-brand-500 text-white border-brand-500'
              : 'bg-zinc-900/60 text-zinc-400 border-zinc-850 hover:text-white'
          }`}
        >
          All ({myBookings.length})
        </button>
        <button
          onClick={() => setFilterTab('requested')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all border shrink-0 cursor-pointer ${
            filterTab === 'requested'
              ? 'bg-brand-500 text-white border-brand-500'
              : 'bg-zinc-900/60 text-zinc-400 border-zinc-850 hover:text-white'
          }`}
        >
          Direct Requests ({myBookings.filter(b => b.status === 'requested').length})
        </button>
        <button
          onClick={() => setFilterTab('active')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all border shrink-0 cursor-pointer ${
            filterTab === 'active'
              ? 'bg-brand-500 text-white border-brand-500'
              : 'bg-zinc-900/60 text-zinc-400 border-zinc-850 hover:text-white'
          }`}
        >
          Active / In Progress ({myBookings.filter(b => ['accepted', 'in_progress', 'price_proposed', 'price_accepted'].includes(b.status)).length})
        </button>
        <button
          onClick={() => setFilterTab('completed')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all border shrink-0 cursor-pointer ${
            filterTab === 'completed'
              ? 'bg-brand-500 text-white border-brand-500'
              : 'bg-zinc-900/60 text-zinc-400 border-zinc-850 hover:text-white'
          }`}
        >
          Completed ({myBookings.filter(b => ['completed', 'seeker_confirmed'].includes(b.status)).length})
        </button>
      </div>

      {/* Bookings List */}
      <div className="flex flex-col gap-4">
        {displayedBookings.length === 0 ? (
          <div className="glass border border-zinc-900 rounded-[28px] p-8 text-center text-zinc-500 text-xs font-light">
            No bookings found matching this filter tab.
          </div>
        ) : (
          displayedBookings.map(bk => (
            <div 
              key={bk.id}
              className="glass border border-zinc-850 hover:border-zinc-750 transition-all rounded-[28px] p-4 cursor-pointer flex flex-col gap-3"
              onClick={() => handleOpenDetails(bk)}
            >
              <div className="flex justify-between items-start">
                <div className="text-left">
                  <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">Ref: {bk.reference}</span>
                  <h4 className="font-extrabold text-sm text-white mt-0.5">{bk.serviceName}</h4>
                </div>
                <span className={`text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider font-extrabold shrink-0 ${getStatusColor(bk.status)}`}>
                  {formatStatus(bk.status)}
                </span>
              </div>

              <div className="flex items-center gap-2.5">
                <img 
                  src={isArtisan 
                    ? `https://api.dicebear.com/7.x/adventurer/svg?seed=${bk.seekerName}` 
                    : bk.artisanAvatar
                  } 
                  className="h-7 w-7 rounded-lg border border-zinc-800 object-cover shrink-0" 
                  alt="" 
                />
                <span className="text-xs font-bold text-zinc-300 truncate">
                  {isArtisan ? bk.seekerName : bk.artisanName}
                </span>
              </div>

              <div className="h-px bg-zinc-900/50"></div>

              <div className="flex justify-between items-center text-[10px] text-zinc-500">
                <div className="flex items-center gap-1 font-semibold text-zinc-400">
                  <Calendar size={10} color="currentColor" variant="Broken" className="text-brand-400" />
                  <span>{new Date(bk.createdAt).toLocaleDateString()}</span>
                </div>
                <span className="font-bold text-white">₦{(bk.finalAmount || bk.estimatedAmount).toLocaleString()}</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Booking Details Modal */}
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
                    {/* Booker Info Box */}
                    <div className="flex items-center gap-3 p-3 rounded-2xl bg-zinc-900/30 border border-zinc-855 mb-4">
                      <img src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${selectedBooking.seekerName}`} className="h-10 w-10 rounded-xl border border-zinc-800 object-cover shrink-0" alt="" />
                      <div className="text-left flex-1 min-w-0">
                        <span className="font-bold text-xs text-white block">{selectedBooking.seekerName}</span>
                        <span className="text-[10px] text-zinc-500 block truncate">{selectedBooking.address}</span>
                      </div>
                      <Button
                        className="px-3.5 py-2 bg-transparent border border-zinc-800 hover:bg-zinc-900 rounded-xl text-xs font-bold text-brand-400 flex items-center gap-1.5 transition-all h-8 cursor-pointer"
                        onClick={() => {
                          handleCloseDetails();
                          navigate(`/chat/${selectedBooking.id}`);
                        }}
                      >
                        <MessageText size={14} color="currentColor" variant="Broken" />
                        <span>Chat</span>
                      </Button>
                    </div>

                    {/* Description & photos */}
                    <div className="mb-4 flex flex-col gap-4 text-xs text-left">
                      <div>
                        <span className="font-bold text-[10px] text-zinc-500 uppercase tracking-wider block mb-1">Issue Description</span>
                        <p className="text-zinc-300 bg-zinc-900/40 border border-zinc-850/60 rounded-xl p-3 leading-relaxed font-light">
                          {selectedBooking.description}
                        </p>
                      </div>

                      {selectedBooking.photos.length > 0 && (
                        <div>
                          <span className="font-bold text-[10px] text-zinc-500 uppercase tracking-wider block mb-2">Attached Photos</span>
                          <div className="flex gap-2 flex-wrap">
                            {selectedBooking.photos.map((ph, i) => (
                              <img key={i} src={ph} className="h-14 w-14 rounded-lg object-cover border border-zinc-850" alt="" />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* ACTION TRIGGERS DEPENDING ON LIFECYCLE (ART-16) */}
                    <div className="mb-4 flex flex-col gap-3">
                      {selectedBooking.status === 'requested' && (
                        <div className="flex gap-3">
                          <Button
                            className="flex-1 h-11 border border-danger-500/20 text-danger hover:bg-danger-500/10 font-bold rounded-xl transition-all text-xs bg-transparent cursor-pointer"
                            onClick={() => handleDecline(selectedBooking)}
                          >
                            Decline
                          </Button>
                          <Button
                            className="flex-1 h-11 font-bold bg-brand-500 hover:bg-brand-600 text-white rounded-xl transition-all text-xs cursor-pointer"
                            onClick={() => handleAccept(selectedBooking)}
                          >
                            Accept Job
                          </Button>
                        </div>
                      )}

                      {selectedBooking.status === 'accepted' && (
                        <Button
                          className="w-full font-bold bg-brand-500 hover:bg-brand-600 h-11 rounded-xl text-white transition-all text-xs cursor-pointer"
                          onClick={() => handleStart(selectedBooking)}
                        >
                          Start Job (Arrived On-Site)
                        </Button>
                      )}

                      {selectedBooking.status === 'in_progress' && (
                        <div className="flex flex-col gap-3 text-left">
                          {!showPriceForm ? (
                            <Button
                              className="w-full font-bold bg-brand-500 hover:bg-brand-600 h-11 rounded-xl text-white transition-all text-xs cursor-pointer"
                              onClick={() => setShowPriceForm(true)}
                            >
                              Propose Final Service Fee
                            </Button>
                          ) : (
                            <div className="glass border border-zinc-850 p-4 rounded-2xl flex flex-col gap-3">
                              <span className="text-xs font-bold text-white flex items-center gap-1">
                                <Money size={14} color="currentColor" variant="Broken" className="text-brand-400" /> Propose Service Fee Breakdown
                              </span>
                              
                              <TextField className="flex flex-col gap-1 w-full">
                                <Label className="text-zinc-400 text-[10px] font-bold uppercase tracking-wider">Labor Charge (₦)</Label>
                                <div className="flex items-center gap-2.5 px-3 py-2.5 border border-zinc-800 rounded-xl bg-zinc-900/50 focus-within:border-brand-500 transition-colors h-10">
                                  <Input
                                    type="number"
                                    className="w-full bg-transparent text-xs text-white focus:outline-none"
                                    value={laborCharge.toString()}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLaborCharge(parseInt(e.target.value) || 0)}
                                  />
                                </div>
                              </TextField>

                              <TextField className="flex flex-col gap-1 w-full">
                                <Label className="text-zinc-400 text-[10px] font-bold uppercase tracking-wider">Materials & Parts (₦)</Label>
                                <div className="flex items-center gap-2.5 px-3 py-2.5 border border-zinc-800 rounded-xl bg-zinc-900/50 focus-within:border-brand-500 transition-colors h-10">
                                  <Input
                                    type="number"
                                    placeholder="0 if no extra materials used"
                                    className="w-full bg-transparent text-xs text-white focus:outline-none"
                                    value={materialsCharge.toString()}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMaterialsCharge(parseInt(e.target.value) || 0)}
                                  />
                                </div>
                              </TextField>

                              {/* Take home net preview (ART-14) */}
                              <div className="flex flex-col gap-1 text-xs bg-zinc-900/80 p-3 rounded-xl border border-zinc-850">
                                <div className="flex justify-between text-zinc-400 text-[11px]">
                                  <span>Total Client Quote:</span>
                                  <strong className="text-white">₦{(laborCharge + materialsCharge).toLocaleString()}</strong>
                                </div>
                                <div className="flex justify-between text-red-400 text-[11px]">
                                  <span>Platform 5% Fee:</span>
                                  <span>-₦{Math.round((laborCharge + materialsCharge) * 0.05).toLocaleString()}</span>
                                </div>
                                <div className="h-px bg-zinc-800 my-0.5"></div>
                                <div className="flex justify-between items-center text-xs">
                                  <span className="text-zinc-300 font-bold">You Take Home (95%):</span>
                                  <span className="font-extrabold text-brand-300 text-sm">
                                    ₦{Math.round((laborCharge + materialsCharge) * 0.95).toLocaleString()}
                                  </span>
                                </div>
                              </div>

                              <div className="flex gap-2 mt-1">
                                <Button
                                  className="flex-1 h-9 font-semibold text-zinc-400 hover:text-white rounded-lg text-xs transition-colors bg-transparent border border-zinc-800 cursor-pointer"
                                  onClick={() => setShowPriceForm(false)}
                                >
                                  Cancel
                                </Button>
                                <Button
                                  className="flex-1 h-9 font-bold bg-brand-500 hover:bg-brand-600 text-white rounded-lg text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                                  onClick={handleProposePrice}
                                  isDisabled={proposing}
                                >
                                  {proposing && <Spinner size="sm" />}
                                  Send Proposal
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {selectedBooking.status === 'price_proposed' && (
                        <div className="glass border border-purple-500/20 bg-purple-500/5 p-4 rounded-2xl text-center">
                          <span className="text-xs font-bold text-purple-300 block mb-1">Proposal Awaiting Client</span>
                          <p className="text-[10px] text-zinc-455 leading-relaxed font-light">
                            We notified the seeker to accept the service charge of ₦{selectedBooking.finalAmount?.toLocaleString()} from their wallet.
                          </p>
                        </div>
                      )}

                      {selectedBooking.status === 'price_accepted' && (
                        <Button
                          className="w-full font-bold text-white bg-success-500 hover:bg-success-600 h-11 rounded-xl transition-all text-xs cursor-pointer"
                          onClick={() => handleMarkComplete(selectedBooking)}
                        >
                          Mark Job Completed
                        </Button>
                      )}

                      {selectedBooking.status === 'completed' && (
                        <div className="glass border border-cyan-500/20 bg-cyan-500/5 p-4 rounded-2xl text-center">
                          <span className="text-xs font-bold text-cyan-300 block mb-1">Awaiting Seeker Confirmation</span>
                          <p className="text-[10px] text-zinc-455 leading-relaxed font-light">
                            Once the seeker verifies the completion, your payout will be instantly released to your wallet ledger.
                          </p>
                        </div>
                      )}
                    </div>
                  </ModalBody>
                  <ModalFooter>
                    <Button
                      className="w-full border border-zinc-800 text-zinc-400 font-bold h-11 rounded-xl text-xs hover:bg-zinc-900 transition-colors bg-transparent cursor-pointer"
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

    </div>
  );
};

export default Bookings;
