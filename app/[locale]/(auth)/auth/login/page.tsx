'use client'
import Login from '@/components/Login';
import '../../../../globals.css'
export default function LoginPage() {
  // const locale = useLocale();
  // const { isLoading } = useAuthRedirect('/'+locale)
  // const t = useTranslations('auth');
  
  // if (isLoading) {
  //   return (
  //     <div className="max-w-md mx-auto py-12 px-4 flex justify-center">
  //       <div className="animate-pulse">Loading...</div>
  //     </div>
  //   )
  // }

  return (
    <div className="max-w-md mx-auto py-12 px-4">
      <Login />
    </div>
  )
}