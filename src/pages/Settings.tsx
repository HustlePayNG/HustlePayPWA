import React, { useState } from 'react';
import { useAppStore } from '../store';
import { User, Call, Location, ShieldSecurity } from 'iconsax-react';
import { TextField, Label, Input, Checkbox, Button, Spinner, toast, Fieldset } from '@heroui/react';

export const Settings: React.FC = () => {
  const { user, updateUserProfile } = useAppStore();

  const [name, setName] = useState(user?.fullName || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [address, setAddress] = useState(user?.address?.formattedAddress || '');
  
  // NDPR compliance toggles (GEN-7)
  const [marketingConsent, setMarketingConsent] = useState(user?.kycStatus ? false : true);
  
  const [saving, setSaving] = useState(false);

  if (!user) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
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
      <h2 className="text-2xl font-extrabold text-white mb-2">Account Settings</h2>
      <p className="text-xs text-zinc-400 leading-relaxed mb-6 font-light">
        Edit your public profile contact information, billing coordinates, and privacy compliance preferences.
      </p>

      <form onSubmit={handleSave} className="flex flex-col gap-4">
        <Fieldset className="glass border border-zinc-850 rounded-[28px] p-5 flex flex-col gap-4">
          <Fieldset.Legend className="flex items-center gap-1.5 mb-2 text-xs font-bold uppercase tracking-wider text-zinc-400">
            <User size={14} color="currentColor" variant="Broken" className="text-brand-400" /> Public Credentials
          </Fieldset.Legend>

          <Fieldset.Group className="flex flex-col gap-4 w-full">
            <TextField className="flex flex-col gap-1.5 w-full">
              <Label className="text-zinc-400 text-xs font-semibold">Full Name</Label>
              <div className="flex items-center gap-2.5 px-3.5 py-3 border border-zinc-800 rounded-xl bg-zinc-900/50 focus-within:border-brand-500 h-11 transition-colors">
                <User className="text-zinc-500 shrink-0" size={16} color="currentColor" variant="Broken" />
                <Input
                  type="text"
                  className="w-full bg-transparent text-xs text-white focus:outline-none"
                  value={name}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
                />
              </div>
            </TextField>

            <TextField className="flex flex-col gap-1.5 w-full">
              <Label className="text-zinc-400 text-xs font-semibold">Phone Number</Label>
              <div className="flex items-center gap-2.5 px-3.5 py-3 border border-zinc-800 rounded-xl bg-zinc-900/50 focus-within:border-brand-500 h-11 transition-colors">
                <Call className="text-zinc-500 shrink-0" size={16} color="currentColor" variant="Broken" />
                <Input
                  type="tel"
                  className="w-full bg-transparent text-xs text-white focus:outline-none"
                  value={phone}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPhone(e.target.value)}
                />
              </div>
            </TextField>

            <TextField className="flex flex-col gap-1.5 w-full">
              <Label className="text-zinc-400 text-xs font-semibold">Service Delivery Location</Label>
              <div className="flex items-center gap-2.5 px-3.5 py-3 border border-zinc-800 rounded-xl bg-zinc-900/50 focus-within:border-brand-500 h-11 transition-colors">
                <Location className="text-zinc-500 shrink-0" size={16} color="currentColor" variant="Broken" />
                <Input
                  type="text"
                  className="w-full bg-transparent text-xs text-white focus:outline-none"
                  value={address}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAddress(e.target.value)}
                />
              </div>
            </TextField>

            <div className="flex items-center gap-1 text-[10px] text-zinc-500 font-semibold leading-relaxed -mt-1 pl-1">
              <Location size={10} color="currentColor" variant="Broken" className="text-brand-400 shrink-0" />
              <span>Coordinates: {user.address?.latitude.toFixed(4)}, {user.address?.longitude.toFixed(4)}</span>
            </div>
          </Fieldset.Group>
        </Fieldset>

        {/* NDPR compliance settings (GEN-7) */}
        <Fieldset className="glass border border-zinc-855 rounded-[28px] p-5 flex flex-col gap-3">
          <Fieldset.Legend className="flex items-center gap-1.5 mb-1 text-xs font-bold uppercase tracking-wider text-zinc-400">
            <ShieldSecurity size={14} color="currentColor" variant="Broken" className="text-brand-400" /> NDPR Privacy Toggles
          </Fieldset.Legend>

          <Fieldset.Group className="flex flex-col gap-3.5 text-xs text-zinc-400 w-full">
            <Checkbox
              isSelected={true}
              isDisabled
              className="flex items-start gap-1 max-w-full m-0 cursor-not-allowed text-zinc-500 text-xs leading-relaxed"
            >
              Allow HustlePay to process KYC records, voter certificates, and location services to match artisans with seeker requests. (Mandatory for service account)
            </Checkbox>

            <Checkbox
              isSelected={marketingConsent}
              onChange={setMarketingConsent}
              className="flex items-start gap-1 max-w-full m-0 cursor-pointer text-zinc-400 text-xs leading-relaxed"
            >
              Opt-in to newsletter distribution and periodic marketing campaigns.
            </Checkbox>
          </Fieldset.Group>
        </Fieldset>

        <div className="w-full mt-2">
          <Button
            type="submit"
            isDisabled={saving}
            className="w-full flex items-center justify-center font-bold h-11 bg-brand-500 hover:bg-brand-600 rounded-2xl shadow-xl shadow-brand-500/10 text-white transition-all gap-2"
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
