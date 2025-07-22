'use client';

import React, { useState, useEffect } from 'react';
import { SalesType } from '@repo/shared/models';
import { Button } from '@repo/ui/button';

interface SalesTypeFormProps {
  salesType: Partial<SalesType> | null;
  onSave: (salesType: Partial<SalesType>) => void;
  onCancel: () => void;
}

export const SalesTypeForm: React.FC<SalesTypeFormProps> = ({ salesType, onSave, onCancel }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [code, setCode] = useState('');
  const [img, setImg] = useState('');
  const [serviceName, setServiceName] = useState('');
  const [model, setModel] = useState('');
  const [sortKey, setSortKey] = useState(0);
  const [status, setStatus] = useState(0);

  useEffect(() => {
    setName(salesType?.name || '');
    setDescription(salesType?.description || '');
    setCode(salesType?.code || '');
    setImg(salesType?.img || '');
    setServiceName(salesType?.service_name || '');
    setModel(salesType?.model || '');
    setSortKey(salesType?.sort_key || 0);
    setStatus(salesType?.status || 0);
  }, [salesType]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...salesType,
      name,
      description: description || null,
      code: code || null,
      img: img || null,
      service_name: serviceName || undefined,
      model: model || undefined,
      sort_key: Number(sortKey),
      status: Number(status),
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-900 dark:text-gray-100">
            판매 유형명 (name)
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
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="serviceName" className="block text-sm font-medium text-gray-900 dark:text-gray-100">
              서비스 이름 (service_name)
            </label>
            <input
              type="text"
              id="serviceName"
              value={serviceName}
              onChange={(e) => setServiceName(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="model" className="block text-sm font-medium text-gray-900 dark:text-gray-100">
              모델 (model)
            </label>
            <input
              type="text"
              id="model"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
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