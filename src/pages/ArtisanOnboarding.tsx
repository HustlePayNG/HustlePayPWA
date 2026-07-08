import React, { useState } from 'react';
import { useAppStore } from '../store';
import { mockDb } from '../services/mockDb';
import { 
  Briefcase, DocumentText, Calendar, Clock, Money, 
  Send2, Danger
} from 'iconsax-react';
import { 
  TextField, Label, Input, TextArea, Checkbox, 
  Select, SelectTrigger, SelectValue, SelectPopover, ListBox, ListBoxItem,
  Button, RadioGroup, Radio, toast, Fieldset
} from '@heroui/react';

export const ArtisanOnboarding: React.FC = () => {
  const { user, refreshUser } = useAppStore();
  const [step, setStep] = useState(1);
  
  // Step 1: Services
  const [selectedCategory, setSelectedCategory] = useState('cat-1');
  const [businessName, setBusinessName] = useState('');
  const [bio, setBio] = useState('');
  const [experience, setExperience] = useState('3');

  // Step 2: KYC
  const [kycDocs, setKycDocs] = useState({
    govId: false,
    certificate: false,
    photo: false
  });

  // Step 3: Availability
  const [availability, setAvailability] = useState([
    { weekday: 'Monday', enabled: true, startTime: '08:00', endTime: '17:00' },
    { weekday: 'Tuesday', enabled: true, startTime: '08:00', endTime: '17:00' },
    { weekday: 'Wednesday', enabled: true, startTime: '08:00', endTime: '17:00' },
    { weekday: 'Thursday', enabled: true, startTime: '08:00', endTime: '17:00' },
    { weekday: 'Friday', enabled: true, startTime: '08:00', endTime: '17:00' },
    { weekday: 'Saturday', enabled: false, startTime: '09:00', endTime: '16:00' },
    { weekday: 'Sunday', enabled: false, startTime: '09:00', endTime: '16:00' }
  ]);

  // Step 4: Training Schedule
  const [selectedTraining, setSelectedTraining] = useState('session-1');

  // Step 5: Pricing
  const [rateType, setRateType] = useState<'hourly' | 'per_service'>('per_service');
  const [baseRate, setBaseRate] = useState(12000);
  const [calloutFee, setCalloutFee] = useState(3000);
  const [additionalCharges] = useState<{ label: string; amount: number }[]>([
    { label: 'Standard materials fee', amount: 2000 }
  ]);

  if (!user) return null;

  // Calculate Net Payout (₦ - 5% commission) (ART-14)
  const calculateNet = (amt: number) => {
    return Math.round(amt * 0.95);
  };

  const handleNext = () => {
    setStep(s => s + 1);
  };

  const handlePrev = () => {
    setStep(s => s - 1);
  };

  const handleSubmitOnboarding = () => {
    const categories = mockDb.getServiceCategories();
    const activeCat = categories.find(c => c.id === selectedCategory) || categories[0];
    
    const mockServices = [
      { name: `${activeCat.name} Standard Service`, description: `General maintenance and diagnostic fixes.`, price: baseRate }
    ];

    mockDb.setupArtisanProfile(
      user.id,
      mockServices,
      {
        rateType,
        baseRate,
        calloutFee,
        additionalCharges
      },
      availability,
      bio,
      parseInt(experience),
      businessName || `${user.fullName}'s Professional Service`
    );

    refreshUser();
  };

  const handleSendReminder = () => {
    const now = new Date().toISOString();
    mockDb.updateUser(user.id, { lastReminderSentAt: now });
    refreshUser();
    toast.success('Approval reminder sent successfully!');
  };

  const checkReminderCooldown = () => {
    if (!user.lastReminderSentAt) return false;
    const sentDate = new Date(user.lastReminderSentAt).getTime();
    const sevenDaysInMs = 7 * 24 * 60 * 60 * 1000;
    return Date.now() - sentDate < sevenDaysInMs;
  };

  const getCooldownDaysLeft = () => {
    if (!user.lastReminderSentAt) return 0;
    const sentDate = new Date(user.lastReminderSentAt).getTime();
    const sevenDaysInMs = 7 * 24 * 60 * 60 * 1000;
    const msDiff = (sentDate + sevenDaysInMs) - Date.now();
    return Math.ceil(msDiff / (24 * 60 * 60 * 1000));
  };

  const handleAdminApprove = () => {
    mockDb.adminApproveArtisan(user.id, true);
    refreshUser();
  };

  // PENDING APPROVAL VIEW (ART-6, ART-7)
  if (user.kycStatus === 'pending_review' || user.kycStatus === 'rejected') {
    const isReminderDisabled = checkReminderCooldown();
    return (
      <div className="flex-1 flex flex-col justify-center px-6 py-12 bg-zinc-955 text-center animate-in fade-in">
        <div className="inline-flex items-center justify-center h-16 w-16 rounded-3xl bg-warning-500/10 border border-warning-500/30 text-warning-400 mb-6 mx-auto">
          <Clock size={32} color="currentColor" variant="Broken" className="animate-pulse" />
        </div>
        <h2 className="text-3xl font-extrabold text-white tracking-tight">Onboarding Pending Approval</h2>
        
        {user.kycStatus === 'rejected' ? (
          <div className="glass border-danger-500/20 bg-danger-500/5 p-4 rounded-2xl my-4 text-left">
            <span className="font-bold text-sm text-danger flex items-center gap-1.5 mb-1">
              <Danger size={16} color="currentColor" variant="Broken" /> Application Revised/Rejected
            </span>
            <p className="text-xs text-zinc-300">Reason: {user.rejectionReason}</p>
          </div>
        ) : (
          <p className="mt-3 text-sm text-zinc-400 max-w-sm mx-auto leading-relaxed font-light">
            Your documents and business profile have been submitted successfully. The review team will verify your details within 48 hours.
          </p>
        )}

        <div className="mt-8 flex flex-col gap-3 max-w-xs mx-auto w-full">
          <Button
            onClick={handleSendReminder}
            isDisabled={isReminderDisabled}
            className={`w-full font-bold h-11 border transition-colors ${isReminderDisabled ? 'border-zinc-800 text-zinc-600 bg-zinc-900/10' : 'border-zinc-800 text-zinc-300 hover:bg-zinc-900 bg-transparent'} flex items-center justify-center gap-2`}
          >
            <Send2 size={16} color="currentColor" variant="Broken" />
            <span>{isReminderDisabled ? `Reminder sent (Wait ${getCooldownDaysLeft()}d)` : 'Send Approval Reminder'}</span>
          </Button>

          <div className="h-px bg-zinc-900 my-4"></div>

          {/* Admin bypass helper */}
          <div className="glass border-brand-500/20 bg-brand-500/5 p-4 rounded-xl text-left border">
            <div className="font-semibold text-xs text-brand-300 mb-1">Demo Shortcut Panel</div>
            <p className="text-[10px] text-zinc-400 mb-3">Skip waiting for manual admin approval. Approve this profile instantly to view the Artisan dashboard:</p>
            <Button
              className="w-full font-bold bg-brand-500 hover:bg-brand-600 text-xs h-10 rounded-lg text-white transition-all"
              onClick={handleAdminApprove}
            >
              Simulate Admin Approval
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col justify-start px-6 py-8 bg-zinc-950">
      
      {/* Onboarding Header */}
      <div className="mb-6 text-left">
        <span className="text-[10px] uppercase font-bold text-brand-400 tracking-wider">Artisan Onboarding</span>
        <h2 className="text-2xl font-extrabold text-white mt-1">Set Up Your Profile</h2>
        <div className="flex gap-1.5 mt-3">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className={`h-1.5 flex-1 rounded-full transition-all ${i <= step ? 'bg-brand-500' : 'bg-zinc-850'}`}></div>
          ))}
        </div>
      </div>

      <div className="glass border border-zinc-800 shadow-xl rounded-[32px] p-5 text-left">
        {/* STEP 1: SERVICE SELECTION */}
        {step === 1 && (
          <div className="flex flex-col gap-4 animate-in fade-in">
            <Fieldset>
              <Fieldset.Legend className="text-sm font-bold text-white flex items-center gap-2 mb-3">
                <Briefcase size={18} color="currentColor" variant="Broken" className="text-brand-400" /> Step 1: Business Details
              </Fieldset.Legend>

              <Fieldset.Group className="flex flex-col gap-4 w-full">
                <div className="flex flex-col gap-1.5 w-full">
                  <span className="text-zinc-400 text-xs font-semibold text-left">Primary Profession</span>
                  <Select selectedKey={selectedCategory} onSelectionChange={(key) => setSelectedCategory(key as string)}>
                    <SelectTrigger className="w-full bg-zinc-900 border border-zinc-855 rounded-xl p-3 text-xs text-white flex justify-between items-center">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectPopover className="bg-zinc-955 border border-zinc-855 rounded-xl p-1 text-white z-50">
                      <ListBox className="outline-none">
                        {mockDb.getServiceCategories().map(cat => (
                          <ListBoxItem id={cat.id} textValue={cat.name} className="p-2 text-xs text-zinc-300 hover:text-white hover:bg-brand-500 rounded-lg cursor-pointer outline-none">
                            {cat.name}
                          </ListBoxItem>
                        ))}
                      </ListBox>
                    </SelectPopover>
                  </Select>
                </div>

                <TextField className="flex flex-col gap-1.5 w-full">
                  <Label className="text-zinc-400 text-xs font-semibold">Business Display Name</Label>
                  <div className="flex items-center gap-2.5 px-3.5 py-3 border border-zinc-800 rounded-xl bg-zinc-900/50 focus-within:border-brand-500 h-11 transition-colors">
                    <Input
                      type="text"
                      placeholder="e.g. Kola Electricals LTD"
                      className="w-full bg-transparent text-xs text-white placeholder:text-zinc-600 focus:outline-none"
                      value={businessName}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setBusinessName(e.target.value)}
                    />
                  </div>
                </TextField>

                <TextField className="flex flex-col gap-1.5 w-full">
                  <Label className="text-zinc-400 text-xs font-semibold">Years of Experience</Label>
                  <div className="flex items-center gap-2.5 px-3.5 py-3 border border-zinc-800 rounded-xl bg-zinc-900/50 focus-within:border-brand-500 h-11 transition-colors">
                    <Input
                      type="number"
                      className="w-full bg-transparent text-xs text-white focus:outline-none"
                      value={experience}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setExperience(e.target.value)}
                    />
                  </div>
                </TextField>

                <div className="flex flex-col gap-1.5 w-full text-left">
                  <label className="text-zinc-400 text-xs font-semibold">Short Bio / Description</label>
                  <TextArea
                    placeholder="Introduce yourself and describe your skills to customers..."
                    value={bio}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setBio(e.target.value)}
                    className="w-full text-xs text-white bg-zinc-900 border border-zinc-855 rounded-xl p-3.5 focus:border-brand-500 outline-none min-h-[90px]"
                  />
                </div>
              </Fieldset.Group>

              <Fieldset.Actions className="mt-4">
                <Button 
                  className="w-full font-bold bg-brand-500 hover:bg-brand-600 h-11 text-white rounded-xl transition-all"
                  onClick={handleNext}
                  isDisabled={!businessName || !bio}
                >
                  Continue
                </Button>
              </Fieldset.Actions>
            </Fieldset>
          </div>
        )}

        {/* STEP 2: KYC DOCUMENT UPLOADS */}
        {step === 2 && (
          <div className="flex flex-col gap-4 animate-in fade-in">
            <Fieldset>
              <Fieldset.Legend className="text-sm font-bold text-white flex items-center gap-2 mb-1">
                <DocumentText size={18} color="currentColor" variant="Broken" className="text-brand-400" /> Step 2: KYC Verification
              </Fieldset.Legend>
              <p className="text-xs text-zinc-400 -mt-2 mb-3 leading-relaxed font-light">
                Upload scans of mandatory documents. Government files are processed securely under NDPR.
              </p>

              <Fieldset.Group className="flex flex-col gap-3.5 w-full">
                <Checkbox
                  isSelected={kycDocs.govId}
                  onChange={(val) => setKycDocs(k => ({ ...k, govId: val }))}
                  className="flex items-center justify-between p-3.5 border border-zinc-800 rounded-2xl bg-zinc-900/30 max-w-full m-0 cursor-pointer text-left w-full"
                >
                  <div>
                    <div className="font-bold text-xs text-white">Government ID</div>
                    <div className="text-[10px] text-zinc-500">NIN, Voter's Card, or Passport</div>
                  </div>
                </Checkbox>

                <Checkbox
                  isSelected={kycDocs.certificate}
                  onChange={(val) => setKycDocs(k => ({ ...k, certificate: val }))}
                  className="flex items-center justify-between p-3.5 border border-zinc-800 rounded-2xl bg-zinc-900/30 max-w-full m-0 cursor-pointer text-left w-full"
                >
                  <div>
                    <div className="font-bold text-xs text-white">Professional Certificate</div>
                    <div className="text-[10px] text-zinc-500">Trade test, training certificate</div>
                  </div>
                </Checkbox>

                <Checkbox
                  isSelected={kycDocs.photo}
                  onChange={(val) => setKycDocs(k => ({ ...k, photo: val }))}
                  className="flex items-center justify-between p-3.5 border border-zinc-800 rounded-2xl bg-zinc-900/30 max-w-full m-0 cursor-pointer text-left w-full"
                >
                  <div>
                    <div className="font-bold text-xs text-white">Passport Photograph</div>
                    <div className="text-[10px] text-zinc-500">For public search avatar</div>
                  </div>
                </Checkbox>
              </Fieldset.Group>

              <Fieldset.Actions className="flex gap-3 mt-5">
                <Button 
                  className="flex-1 h-11 border border-zinc-800 text-zinc-300 font-bold rounded-xl hover:bg-zinc-900 bg-transparent transition-all" 
                  onClick={handlePrev}
                >
                  Back
                </Button>
                <Button 
                  className="flex-1 h-11 font-bold bg-brand-500 text-white rounded-xl hover:bg-brand-600 transition-all" 
                  onClick={handleNext}
                  isDisabled={!kycDocs.govId || !kycDocs.certificate || !kycDocs.photo}
                >
                  Continue
                </Button>
              </Fieldset.Actions>
            </Fieldset>
          </div>
        )}        {/* STEP 3: AVAILABILITY SETUPS */}
        {step === 3 && (
          <div className="flex flex-col gap-4 animate-in fade-in">
            <Fieldset>
              <Fieldset.Legend className="text-sm font-bold text-white flex items-center gap-2 mb-1">
                <Calendar size={18} color="currentColor" variant="Broken" className="text-brand-400" /> Step 3: Availability Schedule
              </Fieldset.Legend>
              <p className="text-xs text-zinc-400 -mt-2 leading-relaxed mb-3 font-light">
                Toggle days and adjust service hours. Seekers can only book you during these hours.
              </p>

              <Fieldset.Group className="flex flex-col gap-2.5 max-h-[250px] overflow-y-auto pr-1 text-xs w-full">
                {availability.map((day, idx) => (
                  <div key={day.weekday} className="flex items-center justify-between p-2.5 border border-zinc-855 rounded-xl bg-zinc-900/20 w-full">
                    <Checkbox
                      isSelected={day.enabled}
                      onChange={(val) => {
                        const updated = [...availability];
                        updated[idx].enabled = val;
                        setAvailability(updated);
                      }}
                      className="text-xs font-semibold text-white cursor-pointer"
                    >
                      {day.weekday}
                    </Checkbox>
                    {day.enabled && (
                      <div className="flex items-center gap-1.5">
                        <input
                          type="time"
                          value={day.startTime}
                          onChange={(e) => {
                            const updated = [...availability];
                            updated[idx].startTime = e.target.value;
                            setAvailability(updated);
                          }}
                          className="bg-zinc-900 text-white border border-zinc-800 rounded p-1 text-[10px] focus:outline-none"
                        />
                        <span className="text-zinc-500">-</span>
                        <input
                          type="time"
                          value={day.endTime}
                          onChange={(e) => {
                            const updated = [...availability];
                            updated[idx].endTime = e.target.value;
                            setAvailability(updated);
                          }}
                          className="bg-zinc-900 text-white border border-zinc-800 rounded p-1 text-[10px] focus:outline-none"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </Fieldset.Group>

              <Fieldset.Actions className="flex gap-3 mt-5">
                <Button 
                  className="flex-1 h-11 border border-zinc-800 text-zinc-300 font-bold rounded-xl hover:bg-zinc-900 bg-transparent transition-all" 
                  onClick={handlePrev}
                >
                  Back
                </Button>
                <Button 
                  className="flex-1 h-11 font-bold bg-brand-500 text-white rounded-xl hover:bg-brand-600 transition-all" 
                  onClick={handleNext}
                >
                  Continue
                </Button>
              </Fieldset.Actions>
            </Fieldset>
          </div>
        )}        {/* STEP 4: TRAINING SCHEDULE */}
        {step === 4 && (
          <div className="flex flex-col gap-4 animate-in fade-in">
            <Fieldset>
              <Fieldset.Legend className="text-sm font-bold text-white flex items-center gap-2 mb-1">
                <Clock size={18} color="currentColor" variant="Broken" className="text-brand-400" /> Step 4: Training Selection
              </Fieldset.Legend>
              <p className="text-xs text-zinc-400 -mt-2 leading-relaxed mb-3 font-light">
                Choose an induction training session to learn about HustlePay work ethics and payout policies.
              </p>

              <Fieldset.Group className="flex flex-col gap-1.5 text-left w-full">
                <span className="text-zinc-400 text-xs font-semibold">Induction Slots</span>
                <Select selectedKey={selectedTraining} onSelectionChange={(key) => setSelectedTraining(key as string)}>
                  <SelectTrigger className="w-full bg-zinc-900 border border-zinc-850 rounded-xl p-3 text-xs text-white flex justify-between items-center">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectPopover className="bg-zinc-955 border border-zinc-850 rounded-xl p-1 text-white z-50">
                    <ListBox className="outline-none">
                      <ListBoxItem id="session-1" textValue="Sat, Jul 4 — 10:00 AM (Online Zoom)" className="p-2 text-xs text-zinc-300 hover:text-white hover:bg-brand-500 rounded-lg cursor-pointer outline-none">Sat, Jul 4 — 10:00 AM (Online Zoom)</ListBoxItem>
                      <ListBoxItem id="session-2" textValue="Wed, Jul 8 — 2:00 PM (Online Zoom)" className="p-2 text-xs text-zinc-300 hover:text-white hover:bg-brand-500 rounded-lg cursor-pointer outline-none">Wed, Jul 8 — 2:00 PM (Online Zoom)</ListBoxItem>
                      <ListBoxItem id="session-3" textValue="Sat, Jul 11 — 10:00 AM (Online Zoom)" className="p-2 text-xs text-zinc-300 hover:text-white hover:bg-brand-500 rounded-lg cursor-pointer outline-none">Sat, Jul 11 — 10:00 AM (Online Zoom)</ListBoxItem>
                    </ListBox>
                  </SelectPopover>
                </Select>
              </Fieldset.Group>

              <Fieldset.Actions className="flex gap-3 mt-5">
                <Button 
                  className="flex-1 h-11 border border-zinc-800 text-zinc-300 font-bold rounded-xl hover:bg-zinc-900 bg-transparent transition-all" 
                  onClick={handlePrev}
                >
                  Back
                </Button>
                <Button 
                  className="flex-1 h-11 font-bold bg-brand-500 text-white rounded-xl hover:bg-brand-600 transition-all" 
                  onClick={handleNext}
                >
                  Continue
                </Button>
              </Fieldset.Actions>
            </Fieldset>
          </div>
        )}

        {/* STEP 5: PRICING CONFIGURATION */}
        {step === 5 && (
          <div className="flex flex-col gap-4 animate-in fade-in text-left">
            <Fieldset>
              <Fieldset.Legend className="text-sm font-bold text-white flex items-center gap-2 mb-1">
                <Money size={18} color="currentColor" variant="Broken" className="text-brand-400" /> Step 5: Pricing Setup
              </Fieldset.Legend>

              <Fieldset.Group className="flex flex-col gap-4 w-full">
                <div className="flex flex-col gap-1.5 w-full text-left">
                  <label className="text-zinc-400 text-xs font-semibold">Base Rate Type</label>
                  <RadioGroup
                    value={rateType}
                    onChange={(val) => setRateType(val as 'hourly' | 'per_service')}
                    orientation="horizontal"
                  >
                    <Radio value="hourly" className="text-xs text-white">Hourly Wage</Radio>
                    <Radio value="per_service" className="text-xs text-white">Fixed Per Job</Radio>
                  </RadioGroup>
                </div>

                <TextField className="flex flex-col gap-1.5 w-full">
                  <Label className="text-zinc-400 text-xs font-semibold">Base Rate (₦)</Label>
                  <div className="flex items-center gap-2.5 px-3.5 py-3 border border-zinc-800 rounded-xl bg-zinc-900/50 focus-within:border-brand-500 h-11 transition-colors">
                    <Input
                      type="number"
                      className="w-full bg-transparent text-xs text-white focus:outline-none"
                      value={baseRate.toString()}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setBaseRate(parseInt(e.target.value) || 0)}
                    />
                  </div>
                </TextField>

                <TextField className="flex flex-col gap-1.5 w-full">
                  <Label className="text-zinc-400 text-xs font-semibold">Call-out Fee (₦)</Label>
                  <div className="flex items-center gap-2.5 px-3.5 py-3 border border-zinc-800 rounded-xl bg-zinc-900/50 focus-within:border-brand-500 h-11 transition-colors">
                    <Input
                      type="number"
                      className="w-full bg-transparent text-xs text-white focus:outline-none"
                      value={calloutFee.toString()}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCalloutFee(parseInt(e.target.value) || 0)}
                    />
                  </div>
                  <span className="text-[10px] text-zinc-500">Secured commitment fee paid by seeker at booking.</span>
                </TextField>

                {/* Commission Take Home Net Preview (ART-14) */}
                <div className="glass border-brand-500/20 bg-brand-500/5 p-4 rounded-2xl flex flex-col gap-2 border w-full">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-zinc-400">Labor Charge:</span>
                    <span className="font-semibold text-white">₦{baseRate.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-zinc-400">HustlePay Commission (5%):</span>
                    <span className="text-red-400 font-semibold">-₦{(baseRate * 0.05).toLocaleString()}</span>
                  </div>
                  <div className="h-px bg-zinc-850 my-1"></div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-bold text-zinc-300">You Will Receive:</span>
                    <span className="font-extrabold text-brand-300 text-base">₦{calculateNet(baseRate).toLocaleString()}</span>
                  </div>
                </div>
              </Fieldset.Group>

              <Fieldset.Actions className="flex gap-3 mt-5">
                <Button 
                  className="flex-1 h-11 border border-zinc-800 text-zinc-300 font-bold rounded-xl hover:bg-zinc-900 bg-transparent transition-all" 
                  onClick={handlePrev}
                >
                  Back
                </Button>
                <Button 
                  className="flex-1 h-11 font-bold bg-brand-500 text-white rounded-xl hover:bg-brand-600 transition-all" 
                  onClick={handleSubmitOnboarding}
                >
                  Submit Application
                </Button>
              </Fieldset.Actions>
            </Fieldset>
          </div>
        )}
      </div>
    </div>
  );
};

export default ArtisanOnboarding;
