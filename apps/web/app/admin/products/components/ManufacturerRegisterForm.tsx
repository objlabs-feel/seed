'use client';

import { useState, useEffect } from 'react';
import { DeviceType } from '@repo/shared/models';
interface ManufacturerFormData {
  name: string
  device_types: number[]
  description: string
}

interface ManufacturerRegisterFormProps {
  onSubmit: (manufacturer: any) => void
  onCancel: () => void
}

export default function ManufacturerRegisterForm({ onSubmit, onCancel }: ManufacturerRegisterFormProps) {
  const [deviceTypes, setDeviceTypes] = useState<DeviceType[]>([]);
  const [formData, setFormData] = useState<ManufacturerFormData>({
    name: '',
    device_types: [],
    description: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchDeviceTypes();
  }, []);

  const fetchDeviceTypes = async () => {
    try {
      const response = await fetch('/api/v1/device-types');
      const data = await response.json();
      setDeviceTypes(data);
    } catch (err) {
      console.error('장비 종류 목록을 불러오는데 실패했습니다.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/v1/manufacturers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const newManufacturer = await response.json();
        onSubmit(newManufacturer);
      } else {
        throw new Error('제조사 등록 중 오류가 발생했습니다.');
      }
    } catch (err) {
      alert('제조사 등록에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeviceTypeChange = (deviceTypeId: number) => {
    setFormData(prev => {
      const newDeviceTypes = prev.device_types.includes(deviceTypeId)
        ? prev.device_types.filter(id => id !== deviceTypeId)
        : [...prev.device_types, deviceTypeId];
      return { ...prev, device_types: newDeviceTypes };
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">제조사명</label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full p-2 border rounded"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">취급 장비</label>
        {deviceTypes.length > 0 ? (
          <div className="space-y-2">
            {deviceTypes.map(deviceType => (
              <label key={deviceType.id} className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.device_types.includes(deviceType.id)}
                  onChange={() => handleDeviceTypeChange(deviceType.id)}
                  className="mr-2"
                />
                {deviceType.name}
              </label>
            ))}
          </div>
        ) : (
          <div className="p-4 text-gray-500 text-center border rounded">
            취급 가능한 장비 없음
          </div>
        )}
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">설명</label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="w-full p-2 border rounded"
          rows={3}
        />
      </div>
      <div className="flex justify-end gap-2 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 bg-gray-500 text-white rounded"
        >
          취소
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-blue-300"
        >
          {loading ? '등록 중...' : '등록하기'}
        </button>
      </div>
    </form>
  );
}