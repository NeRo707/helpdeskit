import { redirect } from 'next/navigation';
import { getMe } from '@/actions/auth';
import { isUser } from '@/lib/utils';

export default async function HomePage() {
  const user = await getMe();

  console.log('User:', user);

  if (user) {
    if (isUser(user)) {
      redirect('/tickets/my');
    }
    redirect('/dashboard');
  }

  redirect('/login');
}
