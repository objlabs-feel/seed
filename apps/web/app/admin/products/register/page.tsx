'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import CompanySelectModal from '../components/CompanySelectModal';
import ManufacturerSelectModal from '../components/ManufacturerSelectModal';
import { Department, DeviceType, Company, Manufacturer } from '@repo/shared/models';

interface FormData {
  start_timestamp: string
  medical_device: {
    company_id: string
    department_id: string
    device_type_id: string
    manufacturer_id: string
    manufacture_date: string
    description: string
    images: string[]
  }
}

export default function ProductRegister() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    start_timestamp: '',
    medical_device: {
      company_id: '',
      department_id: '',
      device_type_id: '',
      manufacturer_id: '',
      manufacture_date: '',
      description: '',
      images: []
    }
  });
  const [departments, setDepartments] = useState<any[]>([]);
  const [deviceTypes, setDeviceTypes] = useState<any[]>([]);
  const [todayCount, setTodayCount] = useState(0);
  const [selectedCompany, setSelectedCompany] = useState<any>(null);
  const [isCompanyModalOpen, setIsCompanyModalOpen] = useState(false);
  const [selectedManufacturer, setSelectedManufacturer] = useState<any>(null);
  const [isManufacturerModalOpen, setIsManufacturerModalOpen] = useState(false);

  useEffect(() => {
    // 부서, 기기 유형 정보 로드
    Promise.all([
      fetch('/api/v1/departments').then(res => res.json()),
      fetch('/api/v1/device-types').then(res => res.json())
    ]).then(([deptData, deviceData]) => {
      setDepartments(deptData);
      setDeviceTypes(deviceData);
    });

    // 오늘 생성된 경매 건수 조회
    const today = new Date().toISOString().split('T')[0];
    fetch(`/api/v1/auction-items/count?date=${today}`)
      .then(res => res.json())
      .then(data => setTodayCount(data.count));
  }, []);

  const handleDepartmentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      medical_device: {
        ...prev.medical_device,
        department: e.target.value
      }
    }));
  };

  const handleDeviceTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      medical_device: {
        ...prev.medical_device,
        device_type: e.target.value
      }
    }));
  };

  const handleCompanySelect = (company: any) => {
    setSelectedCompany(company);
    setFormData(prev => ({
      ...prev,
      medical_device: {
        ...prev.medical_device,
        company_id: company.id.toString()
      }
    }));
    setIsCompanyModalOpen(false);
  };

  const handleManufacturerSelect = (manufacturer: any) => {
    setSelectedManufacturer(manufacturer);
    setFormData(prev => ({
      ...prev,
      medical_device: {
        ...prev.medical_device,
        manufacturer_id: manufacturer.id.toString()
      }
    }));
    setIsManufacturerModalOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/v1/auction-items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        alert('경매 상품이 등록되었습니다.');
        router.push('/admin/products');
      } else {
        throw new Error('등록 중 오류가 발생했습니다.');
      }
    } catch (err) {
      alert('경매 상품 등록 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold mb-6">경매 상품 등록</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <h3 className="font-semibold mb-4">경매 정보</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">시작 시간</label>
              <input
                type="datetime-local"
                value={formData.start_timestamp}
                onChange={(e) => setFormData({
                  ...formData,
                  start_timestamp: e.target.value
                })}
                className="w-full p-2 border rounded"
              />
            </div>
          </div>
        </div>

        <div>
          <h3 className="font-semibold mb-4">의료기기 정보</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">업체 정보</label>
              <div className="flex gap-2 items-center">
                <div className="flex-1 p-2 border rounded bg-gray-50">
                  {selectedCompany ? (
                    <div>
                      <span className="font-medium">{selectedCompany.name}</span>
                      <span className="text-sm text-gray-500 ml-2">
                        ({selectedCompany.company_type === 0 ? '병원' : '일반사업자'})
                      </span>
                    </div>
                  ) : (
                    <span className="text-gray-400">업체를 선택해주세요</span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setIsCompanyModalOpen(true)}
                  className="px-4 py-2 bg-blue-500 text-white rounded"
                >
                  업체 선택
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">진료과</label>
              <select
                value={formData.medical_device.department_id}
                onChange={handleDepartmentChange}
                className="w-full p-2 border rounded"
                required
              >
                <option value="">선택하세요</option>
                {departments.map(dept => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">기기 유형</label>
              <select
                value={formData.medical_device.device_type_id}
                onChange={handleDeviceTypeChange}
                className="w-full p-2 border rounded"
                required
              >
                <option value="">선택하세요</option>
                {deviceTypes.map(type => (
                  <option key={type.id} value={type.id}>
                    {type.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">제조사</label>
              <div className="flex gap-2 items-center">
                <div className="flex-1 p-2 border rounded bg-gray-50">
                  {selectedManufacturer ? (
                    <div>
                      <span className="font-medium">{selectedManufacturer.name}</span>
                      {selectedManufacturer.description && (
                        <span className="text-sm text-gray-500 ml-2">
                          ({selectedManufacturer.description})
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className="text-gray-400">제조사를 선택해주세요</span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setIsManufacturerModalOpen(true)}
                  className="px-4 py-2 bg-blue-500 text-white rounded"
                >
                  제조사 선택
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">제조일</label>
              <input
                type="date"
                value={formData.medical_device.manufacture_date}
                onChange={(e) => setFormData({
                  ...formData,
                  medical_device: {
                    ...formData.medical_device,
                    manufacture_date: e.target.value
                  }
                })}
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">설명</label>
              <textarea
                value={formData.medical_device.description}
                onChange={(e) => setFormData({
                  ...formData,
                  medical_device: {
                    ...formData.medical_device,
                    description: e.target.value
                  }
                })}
                className="w-full p-2 border rounded"
                rows={4}
              />
            </div>
            {/* 이미지 업로드 기능은 별도로 구현 필요 */}
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={() => router.back()}
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

      <CompanySelectModal
        isOpen={isCompanyModalOpen}
        onClose={() => setIsCompanyModalOpen(false)}
        onSelect={handleCompanySelect}
      />
      <ManufacturerSelectModal
        isOpen={isManufacturerModalOpen}
        onClose={() => setIsManufacturerModalOpen(false)}
        onSelect={handleManufacturerSelect}
      />
    </div>
  );
}