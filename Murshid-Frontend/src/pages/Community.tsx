import Navbar from '@/components/Navbar';
import PostsFeed from '@/components/PostsFeed';
import { useState } from 'react';

export default function Community() {
  const [mode, setMode] = useState<'all'|'bookmarks'>('all');
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#e3e8ff] via-[#f5f7ff] to-[#cbd4ff] dark:from-[#0f172a] dark:via-[#1e2a4a] dark:to-[#2a3b6b]">
      <Navbar />
      <div className="max-w-screen-lg mx-auto px-4 sm:px-6 lg:px-10 py-12">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Community</h1>
          <div className="flex gap-2 text-sm">
            <button className={`px-3 py-1 rounded ${mode==='all' ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700'}`} onClick={() => setMode('all')}>All</button>
            <button className={`px-3 py-1 rounded ${mode==='bookmarks' ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700'}`} onClick={() => setMode('bookmarks')}>My Bookmarks</button>
          </div>
        </div>
        <PostsFeed scope="global" mode={mode} />
      </div>
    </div>
  );
}
