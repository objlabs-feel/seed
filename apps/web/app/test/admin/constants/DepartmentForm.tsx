'use client';

import React, { useState, useEffect } from 'react';
import { Department } from '@repo/shared/models';
import { Button } from '@repo/ui/button';

interface DepartmentFormProps {
  department: Partial<Department> | null;
  onSave: (department: Partial<Department>) => void;
  onCancel: () => void;
}

export const DepartmentForm: React.FC<DepartmentFormProps> = ({ department, onSave, onCancel }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [code, setCode] = useState('');
  const [img, setImg] = useState('');
  const [sortKey, setSortKey] = useState(0);
  const [status, setStatus] = useState(0);

  useEffect(() => {
    setName(department?.name || '');
    setDescription(department?.description || '');
    setCode(department?.code || '');
    setImg(department?.img || '');
    setSortKey(department?.sort_key || 0);
    setStatus(department?.status || 0);
  }, [department]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ 
      ...department, 
      name, 
      description: description || null,
      code: code || null,
      img: img || null,
      sort_key: Number(sortKey),
      status: Number(status),
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-900 dark:text-gray-100">
            진료과명 (name)
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            required
          />
        </div>
        <div>
          <label htmlFor="code" className="block text-sm font-medium text-gray-900 dark:text-gray-100">
            코드 (code)
          </label>
          <input
            type="text"
            id="code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-900 dark:text-gray-100">
            설명 (description)
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>
        <div>
          <label htmlFor="img" className="block text-sm font-medium text-gray-900 dark:text-gray-100">
            이미지 URL (img)
          </label>
          <input
            type="text"
            id="img"
            value={img}
            onChange={(e) => setImg(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="sortKey" className="block text-sm font-medium text-gray-900 dark:text-gray-100">
                정렬 키 (sort_key)
              </label>
              <input
                type="number"
                id="sortKey"
                value={sortKey}
                onChange={(e) => setSortKey(Number(e.target.value))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-900 dark:text-gray-100">
                상태 (status)
              </label>
              <input
                type="number"
                id="status"
                value={status}
                onChange={(e) => setStatus(Number(e.target.value))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
        </div>
      </div>
      <div className="mt-6 flex justify-end space-x-2">
        <Button type="button" onClick={onCancel}>
          취소
        </Button>
        <Button type="submit">
          저장
        </Button>
      </div>
    </form>
  );
}; 