import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { BottomNav } from './BottomNav';

export const PublicLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col font-sans text-gray-900 bg-transparent">
      <Navbar />
      {}
      <main className="flex-grow pb-20 md:pb-0">
        <Outlet />
      </main>
      <Footer />
      {/* Bottom Navigation tampilan mobile */}
      <BottomNav />
    </div>
  );
};