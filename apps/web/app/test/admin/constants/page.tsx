'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/app/test/_contexts/AuthContext';
import { Tabs } from '@/components/ui/Tabs';
import DepartmentsTab from './DepartmentsTab'; // Departments 탭 컴포넌트 import
import DeviceTypesTab from './DeviceTypesTab'; // DeviceTypes 탭 컴포넌트 import
import ManufacturersTab from './ManufacturersTab'; // Manufacturers 탭 컴포넌트 import
import SalesTypesTab from './SalesTypesTab'; // SalesTypes 탭 컴포넌트 import

const TAB_NAMES = ['진료과', 'Device Types', 'Manufacturers', 'Sales Types'] as const;
type TabName = typeof TAB_NAMES[number];

export default function ManagementPage() {
  const [selectedTab, setSelectedTab] = useState<TabName>(TAB_NAMES[0]);
  const { token } = useAuth();

  const handleTabChange = (tab: string) => {
    if (TAB_NAMES.includes(tab as TabName)) {
      setSelectedTab(tab as TabName);
    }
  };

  const renderContent = () => {
    if (!token) {
      return (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mt-6 dark:bg-yellow-900 dark:border-yellow-600 dark:text-yellow-200" role="alert">
          <p className="font-bold">Not Logged In</p>
          <p>Please go to the Login page and sign in to fetch data.</p>
        </div>
      );
    }

    switch (selectedTab) {
    case '진료과':
      return <DepartmentsTab token={token} />;
    case 'Device Types':
      return <DeviceTypesTab token={token} />;
    case 'Manufacturers':
      return <ManufacturersTab token={token} />;
    case 'Sales Types':
      return <SalesTypesTab token={token} />;
      // 다른 탭들도 추후 이런 식으로 추가합니다.
      // case 'Sales Types':
      //   return <SalesTypesTab token={token} />;
    default:
      return (
        <div className="mt-6 text-center text-gray-500 dark:text-gray-400">
          <p>Selected: {selectedTab}</p>
          <p>This section is under construction.</p>
        </div>
      );
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Data Management</h1>
      <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">Select a tab to view and manage different data types.</p>

      <div className="mt-4">
        <Tabs tabs={[...TAB_NAMES]} selectedTab={selectedTab} setSelectedTab={handleTabChange} />
      </div>

      <div className="mt-4">
        {renderContent()}
      </div>
    </div>
  );
}