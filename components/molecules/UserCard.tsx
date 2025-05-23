import React from 'react';
import Link from 'next/link';
import Button from '../atoms/Button';
import Avatar from '../atoms/Avatar';

interface UserCardProps {
  id: string;
  fullName: string;
  avatarUrl?: string;
  isFollowing?: boolean;
  onFollow?: () => void;
  locale: string;
}

export default function UserCard({
  id,
  fullName,
  avatarUrl,
  isFollowing = false,
  onFollow,
  locale
}: UserCardProps) {
  return (
    <div className="flex items-center justify-between hover:bg-gray-100 p-2 rounded">
      <Link
        href={`/${locale}/profile/${id}`}
        className="flex items-center gap-3"
      >
        <Avatar 
          src={avatarUrl} 
          alt={fullName} 
          size="sm" 
          fallback={fullName.charAt(0)}
        />
        <span>{fullName}</span>
      </Link>
      
      {onFollow && (
        <Button
          onClick={onFollow}
          variant={isFollowing ? 'secondary' : 'primary'}
          size="sm"
        >
          {isFollowing ? 'Unfollow' : 'Follow'}
        </Button>
      )}
    </div>
  );
}