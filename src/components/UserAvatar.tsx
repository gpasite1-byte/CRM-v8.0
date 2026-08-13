import React from 'react';
import { Usuario } from '../types';

interface UserAvatarProps {
  name?: string;
  foto?: string;
  comerciais?: Usuario[];
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  showName?: boolean;
  nameClassName?: string;
  className?: string;
}

export function getUserPhoto(name?: string, explicitFoto?: string, comerciais?: Usuario[]): string {
  if (explicitFoto && explicitFoto.trim().length > 10) return explicitFoto;
  if (!name || !comerciais || comerciais.length === 0) return '';
  
  const normName = (name || '').normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
  const found = comerciais.find(u => {
    if (!u || !u.nome) return false;
    const uNorm = u.nome.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
    return uNorm === normName || uNorm.includes(normName) || normName.includes(uNorm);
  });
  
  return found?.foto || '';
}

function getInitials(name?: string): string {
  if (!name) return 'U';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function getColorByName(name?: string): string {
  if (!name) return 'bg-blue-600';
  const colors = [
    'bg-[#003366]',
    'bg-indigo-600',
    'bg-emerald-600',
    'bg-amber-600',
    'bg-purple-600',
    'bg-cyan-600',
    'bg-rose-600',
    'bg-teal-600'
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

export default function UserAvatar({
  name = 'Utilizador',
  foto,
  comerciais,
  size = 'md',
  showName = false,
  nameClassName = 'text-xs font-bold text-gray-800',
  className = ''
}: UserAvatarProps) {
  const actualFoto = getUserPhoto(name, foto, comerciais);
  const initials = getInitials(name);
  const bgColor = getColorByName(name);

  const sizeClasses = {
    xs: 'w-6 h-6 text-[10px]',
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-14 h-14 text-base',
    xl: 'w-20 h-20 text-2xl',
    '2xl': 'w-24 h-24 text-3xl'
  };

  const currentSize = sizeClasses[size] || sizeClasses.md;

  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <div className={`relative flex-shrink-0 rounded-full overflow-hidden flex items-center justify-center font-bold text-white shadow-sm border border-gray-200/80 ${currentSize} ${bgColor}`}>
        {actualFoto ? (
          <img
            src={actualFoto}
            alt={name}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover rounded-full"
            onError={(e) => {
              // Fallback if image fails to load
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
        ) : (
          <span className="leading-none select-none tracking-tighter">{initials}</span>
        )}
      </div>
      {showName && (
        <span className={nameClassName} title={name}>
          {name}
        </span>
      )}
    </div>
  );
}
