'use client';

import React, { useState, useEffect } from 'react';
import { Manufacturer } from '@repo/shared/models';
import { Button } from '@repo/ui/button';

interface ManufacturerFormProps {
  manufacturer: Partial<Manufacturer> | null;
  onSave: (manufacturer: Partial<Manufacturer>) => void;
  onCancel: () => void;
}

export const ManufacturerForm: React.FC<ManufacturerFormProps> = ({ manufacturer, onSave, onCancel }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [deviceTypes, setDeviceTypes] = useState('');
  const [img, setImg] = useState('');
  const [status, setStatus] = useState(0);

  useEffect(() => {
    setName(manufacturer?.name || '');
    setDescription(manufacturer?.description || '');
    setDeviceTypes(manufacturer?.device_types ? JSON.stringify(manufacturer.device_types, null, 2) : '');
    setImg(manufacturer?.img || '');
    setStatus(manufacturer?.status || 0);
  }, [manufacturer]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let parsedDeviceTypes = null;
    try {
      if (deviceTypes) {
        parsedDeviceTypes = JSON.parse(deviceTypes);
      }
    } catch (error) {
      alert('Device Types 필드의 JSON 형식이 올바르지 않습니다.');
      return;
    }
    onSave({
      ...manufacturer,
      name,
      description: description || null,
      device_types: parsedDeviceTypes,
      img: img || null,
      status: Number(status),
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-900 dark:text-gray-100">
            제조사명 (name)
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
          <label htmlFor="device_types" className="block text-sm font-medium text-gray-900 dark:text-gray-100">
            관련 기기 타입 (device_types - JSON)
          </label>
          <textarea
            id="device_types"
            value={deviceTypes}
            onChange={(e) => setDeviceTypes(e.target.value)}
            rows={4}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm font-mono"
            placeholder='e.g., ["phone", "tablet"]'
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