'use client';

import { useRouter } from 'next/navigation';

export default function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/admin');
  }

  return (
    <button
      onClick={handleLogout}
      className="text-sm text-slate-400 hover:text-slate-200 transition-colors"
    >
      Logout
    </button>
  );
}
