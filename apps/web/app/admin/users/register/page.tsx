'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import CompanySelectModal from '../../products/components/CompanySelectModal';

interface FormData {
  user: {
    device_token: string;
    status: number;
  };
  profile: {
    name: string;
    email: string;
    mobile: string;
    profile_type: number;
    company_id?: string;
  };
}

export default function UserRegister() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isCompanyModalOpen, setIsCompanyModalOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<any>(null);
  const [formData, setFormData] = useState<FormData>({
    user: {
      device_token: '',
      status: 0
    },
    profile: {
      name: '',
      email: '',
      mobile: '',
      profile_type: 0
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/v1/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || '등록 중 오류가 발생했습니다.');
      }

      const data = await response.json();
      if (data.success) {
        alert(data.message || '이용자가 등록되었습니다.');
        router.push('/admin/users');
      } else {
        throw new Error(data.error?.message || '등록 중 오류가 발생했습니다.');
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : '이용자 등록 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleCompanySelect = (company: any) => {
    setSelectedCompany(company);
    setFormData(prev => ({
      ...prev,
      profile: {
        ...prev.profile,
        company_id: company.id
      }
    }));
    setIsCompanyModalOpen(false);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">이용자 등록</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4">기본 정보</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">상태</label>
                <select
                  value={formData.user.status}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    user: { ...prev.user, status: parseInt(e.target.value) }
                  }))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="0">정상</option>
                  <option value="1">정지</option>
                  <option value="2">탈퇴</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">이름</label>
                <input
                  type="text"
                  value={formData.profile.name}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    profile: { ...prev.profile, name: e.target.value }
                  }))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">이메일</label>
                <input
                  type="email"
                  value={formData.profile.email}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    profile: { ...prev.profile, email: e.target.value }
                  }))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">전화번호</label>
                <input
                  type="tel"
                  value={formData.profile.mobile}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    profile: { ...prev.profile, mobile: e.target.value }
                  }))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">회사</label>
                <div className="mt-1 flex items-center space-x-2">
                  <input
                    type="text"
                    value={selectedCompany?.name || ''}
                    readOnly
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => setIsCompanyModalOpen(true)}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                  >
                    선택
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-blue-300"
            >
              {loading ? '등록 중...' : '등록'}
            </button>
          </div>
        </form>
      </div>

      <CompanySelectModal
        isOpen={isCompanyModalOpen}
        onClose={() => setIsCompanyModalOpen(false)}
        onSelect={handleCompanySelect}
      />
    </div>
  );
}