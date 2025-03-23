import React from 'react';
import Navbar from './Navbar';

const Layout = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 w-full px-4 mx-auto sm:px-6 md:px-8 lg:px-10 max-w-7xl">
        {children}
      </main>
    </div>
  );
};

export default Layout;
