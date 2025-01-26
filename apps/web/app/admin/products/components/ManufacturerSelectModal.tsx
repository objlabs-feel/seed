'use client';

import { useState } from 'react';
import ManufacturerRegisterForm from './ManufacturerRegisterForm';

interface Manufacturer {
  id: number
  name: string
  device_types: string
  img: string | null
  description: string | null
}

interface ManufacturerSelectModalProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (manufacturer: Manufacturer) => void
}

export default function ManufacturerSelectModal({ isOpen, onClose, onSelect }: ManufacturerSelectModalProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [manufacturers, setManufacturers] = useState<Manufacturer[]>([]);
  const [loading, setLoading] = useState(false);
  const [showRegisterForm, setShowRegisterForm] = useState(false);

  const handleSearch = async () => {
    if (!searchTerm) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/v1/manufacturers?search=${searchTerm}`);
      const data = await response.json();
      setManufacturers(data);
    } catch (err) {
      console.error('제조사 검색 중 오류:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSuccess = (newManufacturer: Manufacturer) => {
    setShowRegisterForm(false);
    onSelect(newManufacturer);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 w-[800px] max-h-[90vh] overflow-y-auto">
        {!showRegisterForm ? (
          <>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">제조사 선택</h3>
              <button
                onClick={() => setShowRegisterForm(true)}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
              >
                신규 등록
              </button>
            </div>

            <div className="mb-4 flex gap-2">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 p-2 border rounded"
                placeholder="제조사명 검색..."
              />
              <button
                onClick={handleSearch}
                className="px-4 py-2 bg-blue-500 text-white rounded"
              >
                검색
              </button>
            </div>

            <div className="mb-4 max-h-[400px] overflow-y-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="p-2 text-left">제조사명</th>
                    <th className="p-2 text-left">취급 장비</th>
                    <th className="p-2 text-left">설명</th>
                    <th className="p-2 text-left">작업</th>
                  </tr>
                </thead>
                <tbody>
                  {manufacturers.map(manufacturer => (
                    <tr key={manufacturer.id} className="border-b">
                      <td className="p-2">{manufacturer.name}</td>
                      <td className="p-2">{manufacturer.device_types}</td>
                      <td className="p-2">{manufacturer.description}</td>
                      <td className="p-2">
                        <button
                          onClick={() => onSelect(manufacturer)}
                          className="text-blue-500 hover:text-blue-700"
                        >
                          선택
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-500 text-white rounded"
              >
                닫기
              </button>
            </div>
          </>
        ) : (
          <>
            <h3 className="text-lg font-semibold mb-4">신규 제조사 등록</h3>
            <ManufacturerRegisterForm
              onSubmit={handleRegisterSuccess}
              onCancel={() => setShowRegisterForm(false)}
            />
          </>
        )}
      </div>
    </div>
  );
}