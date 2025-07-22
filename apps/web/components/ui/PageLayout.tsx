import React from 'react';

interface PageLayoutProps {
  title: string;
  children: React.ReactNode;
}

export const PageLayout: React.FC<PageLayoutProps> = ({ title, children }) => {
  return (
    <main className="container mx-auto p-4 sm:p-6 lg:p-8">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6">{title}</h1>
      <div className="space-y-8">
        {children}
      </div>
    </main>
  );
};


/*
'use client';

import React from 'react';

interface TabsProps {
  tabs: string[];
  selectedTab: string;
  setSelectedTab: (tab: string) => void;
}

export const Tabs: React.FC<TabsProps> = ({ tabs, selectedTab, setSelectedTab }) => {
  return (
    <div className="border-b border-gray-200 dark:border-gray-700">
      <nav className="-mb-px flex space-x-6" aria-label="Tabs">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setSelectedTab(tab)}
            className={`${
              tab === selectedTab
                ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
            aria-current={tab === selectedTab ? 'page' : undefined}
          >
            {tab}
          </button>
        ))}
      </nav>
    </div>
  );
};
*/