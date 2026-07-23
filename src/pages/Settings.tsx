import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store';
import { User, Call, Location, ShieldSecurity, ArrowLeft } from 'iconsax-react';
import { TextField, Label, Input, Button, Spinner, Fieldset, toast } from '@heroui/react';

import CustomCheckbox from '../components/CustomCheckbox';

export const Settings: React.FC = () => {
  const navigate = useNavigate();
  const { user, updateUserProfile } = useAppStore();

  const [name, setName] = useState(user?.fullName || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [address, setAddress] = useState(user?.address?.formattedAddress || '');

  // NDPR compliance toggles (GEN-7)
  const [marketingConsent, setMarketingConsent] = useState(user?.kycStatus ? false : true);

  const [saving, setSaving] = useState(false);
  const [nameError, setNameError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [addressError, setAddressError] = useState('');

  if (!user) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    let hasError = false;

    if (!name) {
      setNameError('Full name is required.');
      hasError = true;
    } else {
      setNameError('');
    }

    if (!phone) {
      setPhoneError('Phone number is required.');
      hasError = true;
    } else {
      setPhoneError('');
    }

    if (!address) {
      setAddressError('Service delivery location is required.');
      hasError = true;
    } else {
      setAddressError('');
    }

    if (hasError) return;

    setSaving(true);
    setTimeout(() => {
      updateUserProfile({
        fullName: name,
        phone,
        address: {
          formattedAddress: address,
          latitude: user.address?.latitude || 6.5244,
          longitude: user.address?.longitude || 3.3792
        }
      });
      setSaving(false);
      toast.success('Profile updated successfully!');
    }, 1200);
  };

  return (
    <div className="flex-1 flex flex-col px-4 py-6 bg-zinc-955 text-left animate-in fade-in pb-20">
      {/* Top Circular Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="h-10 w-10 flex items-center justify-center bg-zinc-100/50 hover:bg-zinc-200/50 rounded-full text-zinc-600 mb-4 cursor-pointer transition-all active:scale-90"
      >
        <ArrowLeft size={18} color="currentColor" variant="Broken" />
      </button>

      <h2 className="text-2xl font-extrabold text-white mb-2">Account Settings</h2>
      <p className="text-xs text-zinc-400 leading-relaxed mb-6 font-light">
        Edit your public profile contact information, billing coordinates, and privacy compliance preferences.
      </p>

      <form onSubmit={handleSave} className="flex flex-col gap-4">
        <Fieldset className="glass border border-zinc-850 rounded-[28px] p-5 flex flex-col gap-4">
          <div className="flex items-center gap-1.5 mb-2 text-xs font-bold uppercase tracking-wider text-zinc-400">
            <User size={14} color="currentColor" variant="Broken" className="text-brand-400" /> Public Credentials
          </div>

          <Fieldset.Group className="flex flex-col gap-4 w-full">
            <TextField className="flex flex-col gap-1.5 w-full">
              <Label className={`text-xs font-semibold transition-colors ${nameError ? 'text-danger' : 'text-zinc-400'}`}>Full Name</Label>
              <div className={`flex items-center gap-2.5 px-3.5 py-3 border rounded-xl bg-zinc-900/50 h-11 transition-all focus-within:border-brand-500 ${nameError ? 'border-danger focus-within:border-danger' : 'border-zinc-800'}`}>
                <User className={`shrink-0 transition-colors ${nameError ? 'text-danger' : 'text-zinc-500'}`} size={16} color="currentColor" variant="Broken" />
                <Input
                  type="text"
                  className="w-full bg-transparent text-xs text-white focus:outline-none"
                  value={name}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    setName(e.target.value);
                    if (e.target.value) setNameError('');
                  }}
                />
              </div>
              {nameError && (
                <span className="text-[10px] text-danger font-semibold text-left">{nameError}</span>
              )}
            </TextField>

            <TextField className="flex flex-col gap-1.5 w-full">
              <Label className={`text-xs font-semibold transition-colors ${phoneError ? 'text-danger' : 'text-zinc-400'}`}>Phone Number</Label>
              <div className={`flex items-center gap-2.5 px-3.5 py-3 border rounded-xl bg-zinc-900/50 h-11 transition-all focus-within:border-brand-500 ${phoneError ? 'border-danger focus-within:border-danger' : 'border-zinc-800'}`}>
                <Call className={`shrink-0 transition-colors ${phoneError ? 'text-danger' : 'text-zinc-500'}`} size={16} color="currentColor" variant="Broken" />
                <Input
                  type="tel"
                  className="w-full bg-transparent text-xs text-white focus:outline-none"
                  value={phone}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    setPhone(e.target.value);
                    if (e.target.value) setPhoneError('');
                  }}
                />
              </div>
              {phoneError && (
                <span className="text-[10px] text-danger font-semibold text-left">{phoneError}</span>
              )}
            </TextField>

            <TextField className="flex flex-col gap-1.5 w-full">
              <Label className={`text-xs font-semibold transition-colors ${addressError ? 'text-danger' : 'text-zinc-400'}`}>Service Delivery Location</Label>
              <div className={`flex items-center gap-2.5 px-3.5 py-3 border rounded-xl bg-zinc-900/50 h-11 transition-all focus-within:border-brand-500 ${addressError ? 'border-danger focus-within:border-danger' : 'border-zinc-800'}`}>
                <Location className={`shrink-0 transition-colors ${addressError ? 'text-danger' : 'text-zinc-500'}`} size={16} color="currentColor" variant="Broken" />
                <Input
                  type="text"
                  className="w-full bg-transparent text-xs text-white focus:outline-none"
                  value={address}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    setAddress(e.target.value);
                    if (e.target.value) setAddressError('');
                  }}
                />
              </div>
              {addressError && (
                <span className="text-[10px] text-danger font-semibold text-left">{addressError}</span>
              )}
            </TextField>

            <div className="flex items-center gap-1 text-[10px] text-zinc-500 font-semibold leading-relaxed -mt-1 pl-1">
              <Location size={10} color="currentColor" variant="Broken" className="text-brand-400 shrink-0" />
              <span>Coordinates: {user.address?.latitude.toFixed(4)}, {user.address?.longitude.toFixed(4)}</span>
            </div>
          </Fieldset.Group>
        </Fieldset>

        {/* NDPR compliance settings (GEN-7) */}
        <Fieldset className="glass border border-zinc-855 rounded-[28px] p-5 flex flex-col gap-3">
          <div className="flex items-center gap-1.5 mb-1 text-xs font-bold uppercase tracking-wider text-zinc-400">
            <ShieldSecurity size={14} color="currentColor" variant="Broken" className="text-brand-400" /> NDPR Privacy Toggles
          </div>

          <Fieldset.Group className="flex flex-col gap-3.5 text-xs text-zinc-400 w-full">
            <CustomCheckbox
              isSelected={true}
              isDisabled
              onChange={() => {}}
            >
              Allow HustlePay to process KYC records, voter certificates, and location services to match artisans with seeker requests. (Mandatory for service account)
            </CustomCheckbox>

            <CustomCheckbox
              isSelected={marketingConsent}
              onChange={setMarketingConsent}
            >
              Opt-in to newsletter distribution and periodic marketing campaigns.
            </CustomCheckbox>
          </Fieldset.Group>
        </Fieldset>


        <div className="w-full mt-2">
          <Button
            type="submit"
            isDisabled={saving}
            className="w-full flex items-center justify-center font-bold h-11 bg-brand-500 hover:bg-brand-600 rounded-2xl text-white transition-all gap-2"
          >
            {saving && <Spinner size="sm" />}
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
};

export default Settings;