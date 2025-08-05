'use client';

import { useState, useEffect } from 'react';
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

export default function UserEdit({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
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

  useEffect(() => {
    fetchUser();
  }, [params.id]);

  const fetchUser = async () => {
    try {
      const response = await fetch(`/admin/api/v1/users/${params.id}`,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${document.cookie.split('admin_token=')[1]}`,
          },
        }
      );

      console.log('response', response);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || '사용자 정보를 불러오는데 실패했습니다.');
      }
      const data = await response.json();

      if (data.success && data.data) {
        if (data.data.company) {
          setSelectedCompany(data.data.company);
        }

        setFormData({
          user: {
            device_token: data.data.device_token,
            status: data.data.status
          },
          profile: {
            name: data.data.profile.name,
            email: data.data.profile.email,
            mobile: data.data.profile.mobile,
            profile_type: data.data.profile.profile_type,
            company_id: data.data.profile.company_id
          }
        });
      } else {
        throw new Error(data.error?.message || '데이터를 불러오는데 실패했습니다.');
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : '이용자 정보를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`/admin/api/v1/users/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || '수정 중 오류가 발생했습니다.');
      }

      const data = await response.json();
      if (data.success) {
        alert(data.message || '이용자 정보가 수정되었습니다.');
        router.push('/admin/users');
      } else {
        throw new Error(data.error?.message || '수정 중 오류가 발생했습니다.');
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : '이용자 정보 수정 중 오류가 발생했습니다.');
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

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">이용자 정보 수정</h1>

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
                  <option value="0">정지</option>
                  <option value="1">정상</option>                  
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
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              저장
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