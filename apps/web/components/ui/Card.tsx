import React from 'react';

interface CardProps {
  title: string;
  children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ title, children }) => {
  return (
    <div className="p-6 border rounded-lg shadow-md bg-white">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">{title}</h2>
      <div>{children}</div>
    </div>
  );
};