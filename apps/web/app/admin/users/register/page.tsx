'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import CompanySelectModal from '../../products/components/CompanySelectModal';

interface FormData {
  user: {
    device_token: string
    status: number
  }
  profile: {
    name: string
    email: string
    mobile: string
    profile_type: number
    company_id?: number
  }
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

      if (response.ok) {
        alert('이용자가 등록되었습니다.');
        router.push('/admin/users');
      } else {
        throw new Error('등록 중 오류가 발생했습니다.');
      }
    } catch (err) {
      alert('이용자 등록 중 오류가 발생했습니다.');
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
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold mb-6">이용자 등록</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <h3 className="font-semibold mb-4">기본 정보</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">이름</label>
              <input
                type="text"
                value={formData.profile.name}
                onChange={(e) => setFormData({
                  ...formData,
                  profile: {
                    ...formData.profile,
                    name: e.target.value
                  }
                })}
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">이메일</label>
              <input
                type="email"
                value={formData.profile.email}
                onChange={(e) => setFormData({
                  ...formData,
                  profile: {
                    ...formData.profile,
                    email: e.target.value
                  }
                })}
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">전화번호</label>
              <input
                type="tel"
                value={formData.profile.mobile}
                onChange={(e) => setFormData({
                  ...formData,
                  profile: {
                    ...formData.profile,
                    mobile: e.target.value
                  }
                })}
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">프로필 유형</label>
              <select
                value={formData.profile.profile_type}
                onChange={(e) => setFormData({
                  ...formData,
                  profile: {
                    ...formData.profile,
                    profile_type: parseInt(e.target.value)
                  }
                })}
                className="w-full p-2 border rounded"
              >
                <option value={0}>병원장</option>
                <option value={1}>기업</option>
                <option value={2}>관계자</option>
                <option value={3}>기관</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">소속 업체</label>
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
              <label className="block text-sm font-medium mb-1">상태</label>
              <select
                value={formData.user.status}
                onChange={(e) => setFormData({
                  ...formData,
                  user: {
                    ...formData.user,
                    status: parseInt(e.target.value)
                  }
                })}
                className="w-full p-2 border rounded"
                required
              >
                <option value={0}>정상</option>
                <option value={1}>정지</option>
                <option value={2}>탈퇴</option>
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
    </div>
  );
}