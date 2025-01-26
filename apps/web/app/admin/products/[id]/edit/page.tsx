'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Department {
  id: number
  code: string
  name: string
}

interface DeviceType {
  id: number
  code: string
  name: string
}

export default function ProductEdit({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    auction_code: '',
    start_timestamp: '',
    medical_device: {
      description: '',
      company_id: '',
      department: '',
      device_type: '',
      manufacturer_id: '',
      manufacture_date: '',
      images: [] as string[]
    }
  });
  const [departments, setDepartments] = useState<Department[]>([]);
  const [deviceTypes, setDeviceTypes] = useState<DeviceType[]>([]);

  useEffect(() => {
    Promise.all([
      fetch('/api/v1/departments').then(res => res.json()),
      fetch('/api/v1/device-types').then(res => res.json()),
      fetch(`/api/v1/auction-items/${params.id}`).then(res => res.json())
    ]).then(([deptData, deviceData, productData]) => {
      setDepartments(deptData);
      setDeviceTypes(deviceData);
      setFormData({
        auction_code: productData.auction_code,
        start_timestamp: productData.start_timestamp,
        medical_device: {
          description: productData.medicalDevice.description,
          company_id: productData.medicalDevice.company_id,
          department: productData.medicalDevice.department,
          device_type: productData.medicalDevice.device_type,
          manufacturer_id: productData.medicalDevice.manufacturer_id,
          manufacture_date: productData.medicalDevice.manufacture_date?.substring(0, 10) || '',
          images: productData.medicalDevice.images
        }
      });
      setLoading(false);
    }).catch(err => {
      setError('상품 정보를 불러오는데 실패했습니다.');
      setLoading(false);
    });
  }, [params.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch(`/api/v1/auction-items/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        alert('수정이 완료되었습니다.');
        router.push(`/admin/products/${params.id}`);
      } else {
        throw new Error('수정 중 오류가 발생했습니다.');
      }
    } catch (err) {
      alert('수정 중 오류가 발생했습니다.');
    }
  };

  if (loading) return <div>로딩 중...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold mb-6">경매 상품 수정</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <h3 className="font-semibold mb-4">경매 정보</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">상품 코드</label>
              <input
                type="text"
                value={formData.auction_code}
                className="w-full p-2 border rounded bg-gray-100"
                disabled
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">시작 시간</label>
              <input
                type="date"
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
            <div>
              <label className="block text-sm font-medium mb-1">진료과</label>
              <select
                value={formData.medical_device.department}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  medical_device: {
                    ...prev.medical_device,
                    department: e.target.value
                  }
                }))}
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
                value={formData.medical_device.device_type}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  medical_device: {
                    ...prev.medical_device,
                    device_type: e.target.value
                  }
                }))}
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
            className="px-4 py-2 bg-blue-500 text-white rounded"
          >
            저장
          </button>
        </div>
      </form>
    </div>
  );
}