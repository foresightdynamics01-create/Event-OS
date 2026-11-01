/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import producerAvatar from '../assets/images/producer_avatar_1793552717561.jpg';

interface SarahAvatarProps {
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  showStatusIndicator?: boolean;
}

const SIZE_MAP = {
  xs: 'w-6 h-6 text-[10px]',
  sm: 'w-7 h-7 text-xs',
  md: 'w-8 h-8 text-xs',
  lg: 'w-10 h-10 text-sm',
};

export const SarahAvatar: React.FC<SarahAvatarProps> = ({
  className = '',
  size = 'md',
  showStatusIndicator = false,
}) => {
  const [imgFailed, setImgFailed] = useState(false);
  const sizeClasses = SIZE_MAP[size] || SIZE_MAP.md;

  return (
    <div className={`relative inline-block shrink-0 ${sizeClasses} ${className}`}>
      {!imgFailed ? (
        <img
          src={producerAvatar || './images/producer_avatar.jpg'}
          alt="Sarah Jenkins"
          referrerPolicy="no-referrer"
          className="w-full h-full rounded-full object-cover border border-zinc-700 bg-zinc-800"
          onError={(e) => {
            const currentSrc = e.currentTarget.src;
            if (!currentSrc.includes('/images/producer_avatar.jpg')) {
              e.currentTarget.src = '/images/producer_avatar.jpg';
            } else if (!currentSrc.includes('./images/producer_avatar.jpg')) {
              e.currentTarget.src = './images/producer_avatar.jpg';
            } else {
              setImgFailed(true);
            }
          }}
        />
      ) : (
        <div
          className="w-full h-full rounded-full bg-gradient-to-br from-indigo-900 to-zinc-900 border border-indigo-700/60 flex items-center justify-center font-mono font-semibold text-indigo-200 select-none shadow-inner"
          title="Sarah Jenkins, Lead Concierge"
          aria-label="Sarah Jenkins"
        >
          SJ
        </div>
      )}
      {showStatusIndicator && (
        <span
          className="w-2 h-2 rounded-full bg-emerald-500 absolute bottom-0 right-0 border border-zinc-950 shadow-sm"
          title="Concierge Active"
          aria-hidden="true"
        />
      )}
    </div>
  );
};
