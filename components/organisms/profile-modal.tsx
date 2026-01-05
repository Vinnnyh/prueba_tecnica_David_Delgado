import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { X, Camera, Phone, Mail, User as UserIcon, Save } from 'lucide-react';
import { useAtomValue } from 'jotai';
import { userAtom } from '@/lib/auth/atoms';
import { Button } from '@/components/atoms/button';
import { Input } from '@/components/atoms/input';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProfileModal = ({ isOpen, onClose }: ProfileModalProps) => {
  const user = useAtomValue(userAtom);
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setPhone(user.phone || '');
    }
  }, [user, isOpen]);

  const handleSave = async () => {
    if (!user) return;
    const hasChanged = name !== user.name || phone !== (user.phone || '');

    if (!hasChanged) {
      onClose();
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch('/api/auth/update-profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone }),
      });

      if (res.ok) {
        window.location.reload();
      } else {
        const errorData = await res.json();
        alert(errorData.message || 'Failed to update profile');
        setIsSaving(false);
      }
    } catch {
      alert('An error occurred while updating your profile');
      setIsSaving(false);
    }
  };

  if (!isOpen || !user) return null;

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center p-4'>
      <div
        className='absolute inset-0 bg-black/60 backdrop-blur-sm'
        onClick={onClose}
      />

      <div className='relative w-full max-w-md bg-brand-sidebar border border-white/10 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200'>
        <div className='p-6 border-b border-white/5 flex items-center justify-between'>
          <h2 className='text-xl font-bold'>Edit Profile</h2>
          <button
            onClick={onClose}
            className='p-2 hover:bg-white/5 rounded-full transition-colors'
          >
            <X size={20} className='text-gray-400' />
          </button>
        </div>

        <div className='p-8 space-y-8'>
          <div className='flex flex-col items-center gap-4'>
            <div className='relative group'>
              <div className='relative w-24 h-24'>
                <Image
                  src={
                    user.image ||
                    'https://avatar.iran.liara.run/public/job/designer/male'
                  }
                  alt='Profile'
                  fill
                  className='rounded-full border-2 border-brand-accent p-1 object-cover'
                />
              </div>
              <div className='absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer'>
                <Camera size={24} className='text-white' />
              </div>
            </div>
            <div className='text-center'>
              <p className='text-lg font-bold'>{user.name}</p>
              <p className='text-sm text-gray-500'>{user.email}</p>
            </div>
          </div>

          <div className='space-y-4'>
            <div className='space-y-2'>
              <label className='text-xs font-bold text-gray-500 uppercase tracking-widest ml-1'>
                Full Name
              </label>
              <Input
                leftIcon={<UserIcon size={18} />}
                value={name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setName(e.target.value)
                }
                placeholder='Your name'
              />
            </div>

            <div className='space-y-2'>
              <label className='text-xs font-bold text-gray-500 uppercase tracking-widest ml-1'>
                Phone Number
              </label>
              <Input
                leftIcon={<Phone size={18} />}
                value={phone}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setPhone(e.target.value)
                }
                placeholder='+1 (555) 000-0000'
              />
            </div>

            <div className='space-y-2'>
              <label className='text-xs font-bold text-gray-500 uppercase tracking-widest ml-1'>
                Email Address
              </label>
              <Input
                leftIcon={<Mail size={18} />}
                value={user.email}
                disabled
                className='opacity-50 cursor-not-allowed'
              />
            </div>
          </div>
        </div>

        <div className='p-6 bg-white/5 border-t border-white/5 flex gap-3'>
          <Button variant='outline' className='flex-1' onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant='primary'
            className='flex-1'
            onClick={handleSave}
            isLoading={isSaving}
            leftIcon={<Save size={18} />}
          >
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
};
