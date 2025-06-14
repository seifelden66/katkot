import { useSession } from '@/contexts/SessionContext';
import { useUnreadNotificationsCount } from '@/app/hooks/queries/usePostQueries';

export default function NotificationBadge() {
  const { session } = useSession();
  const { data: count = 0 } = useUnreadNotificationsCount(session?.user?.id);
  
  if (count === 0) return null;
  
  return (
    <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
      {count > 9 ? '9+' : count}
    </div>
  );
}