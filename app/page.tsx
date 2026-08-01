import { redirect } from 'next/navigation';
import { getMe } from '@/actions/auth';

export default async function HomePage() {
  const user = await getMe();

  if (user) {
    if (user.role === 'USER') {
      redirect('/tickets/my');
    }
    redirect('/dashboard');
  }

  redirect('/login');
}
