'use client';

import { useState, useEffect } from 'react';
import { PageLayout } from '@/components/ui/PageLayout';
import { Card } from '@/components/ui/Card';
import { Input } from '@repo/ui/input';
import { Button } from '@repo/ui/button';
import { DeviceType } from '@repo/shared/models';
import { ResultDisplay } from '@/components/ui/ResultDisplay';
import { authenticateUser } from '@/libs/auth';

// Define interfaces for the dropdown data
interface Department {
  id: string;
  name: string;
  code: string;
  deviceTypes?: DeviceType[];
}

interface Manufacturer {
  id: number;
  name: string;
}

interface SalesType {
  id: number;
  name: string;
}

interface FormData {
  department: string;
  equipmentType: string;
  manufacturer: string;
  salesType: string;
  searchKeyword: string;
  name: string;
  phone: string;
  hospitalName: string;
  location: string;
  manufacturingYear: string;
  description: string;
  images: string[];
  status: number;
}

interface SaleItemListResponse {
  data: any[];
  total: number;
  totalPages: number;
  page: number;
  limit: number;
}

interface ApiError {
  error: string;
}

export default function SaleItemTestPage() {
  const [formData, setFormData] = useState<FormData>({
    department: '',
    equipmentType: '',
    manufacturer: '',
    salesType: '1',
    searchKeyword: '',
    name: '김경매',
    phone: '010-9876-5432',
    hospitalName: '서울병원',
    location: '서울',
    manufacturingYear: '2020-01-01',
    description: '경매로 등록하는 테스트 장비입니다.',
    images: ['auction_image1.jpg', 'auction_image2.jpg'],
    status: 1,
  });

  const [departments, setDepartments] = useState<Department[]>([]);
  const [deviceTypes, setDeviceTypes] = useState<DeviceType[]>([]);
  const [manufacturers, setManufacturers] = useState<Manufacturer[]>([]);
  const [salesTypes, setSalesTypes] = useState<SalesType[]>([]);
  const [authToken, setAuthToken] = useState('');
  
  const [listResponse, setListResponse] = useState<SaleItemListResponse | null>(null);
  const [createResponse, setCreateResponse] = useState<object | null>(null);
  const [error, setError] = useState<ApiError | null>(null);
  const [loading, setLoading] = useState(false);

  // 페이지네이션 상태
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedSalesType, setSelectedSalesType] = useState<number | undefined>();
  const [selectedStatus, setSelectedStatus] = useState<number | undefined>();

  // localStorage에서 토큰 가져오기
  useEffect(() => {
    const storedToken = localStorage.getItem('client_token');
    if (storedToken) {
      setAuthToken(storedToken);
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [deptsRes, typesRes, mfrsRes, salesTypesRes] = await Promise.all([
          fetch('/api/v1/departments', {
            headers: {
              'Authorization': `Bearer ${authToken}`,
            },
          }),
          fetch('/api/v1/device-types', {
            headers: {
              'Authorization': `Bearer ${authToken}`,
            },
          }),
          fetch('/api/v1/manufacturers', {
            headers: {
              'Authorization': `Bearer ${authToken}`,
            },
          }),
          fetch('/api/v1/sales-types', {
            headers: {
              'Authorization': `Bearer ${authToken}`,
            },
          }),
        ]);

        if (!deptsRes.ok || !typesRes.ok || !mfrsRes.ok || !salesTypesRes.ok) {
          throw new Error('필수 데이터 로딩 실패');
        }

        const [depts, types, mfrs, salesTypes] = await Promise.all([
          deptsRes.json(),
          typesRes.json(),
          mfrsRes.json(),
          salesTypesRes.json(),
        ]);

        console.log('API Response:', {
          departments: depts,
          deviceTypes: types,
          manufacturers: mfrs,
          salesTypes: salesTypes
        });

        // id 값을 문자열로 변환
        setDepartments((depts.data || []).map((d: any) => ({ ...d, id: d.id.toString() })));
        setDeviceTypes((types.data || []).map((t: any) => ({ ...t, id: t.id.toString() })));
        setManufacturers((mfrs.data || []).map((m: any) => ({ ...m, id: m.id.toString() })));
        setSalesTypes((salesTypes.data || []).map((s: any) => ({ ...s, id: s.id.toString() })));
      } catch (e) {
        setError({ error: '필수 데이터(진료과, 장비 타입, 제조사, 판매유형) 로딩 실패' });
      } finally {
        setLoading(false);
      }
    };

    if (authToken) {
      fetchData();
    }
  }, [authToken]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const newData = { ...prev, [name]: value.toString() };
      // 진료과가 변경되면 장비 타입 선택 초기화
      if (name === 'department') {
        newData.equipmentType = '';
      }
      return newData;
    });
  };

  const clearState = () => {
    setCreateResponse(null);
    setListResponse(null);
    setError(null);
  };

  const handleCreateSaleItem = async (e: React.FormEvent) => {
    e.preventDefault();
    clearState();
    setLoading(true);

    if (!authToken) {
      setError({ error: '인증 토큰을 입력해주세요.' });
      setLoading(false);
      return;
    }

    try {
      let itemId: string;

      // sales_type에 따라 아이템 생성
      const saleItemResponse = await fetch('/api/v1/saleitems', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          sales_type: Number(formData.salesType),          
          status: formData.status,
          name: formData.name,
          phone: formData.phone,
          hospitalName: formData.hospitalName,
          location: formData.location,
          department_id: formData.department,
          device_type_id: formData.equipmentType,
          manufacturer_id: formData.manufacturer,
          manufacture_date: formData.manufacturingYear,
          description: formData.description,
          images: formData.images,
        }),
      });

      const data = await saleItemResponse.json();
      if (!saleItemResponse.ok) {
        throw new Error(data.error || '판매 아이템 생성 실패');
      }

      setCreateResponse(data);
      // 생성 후 목록 새로고침
      handleListSaleItems();
    } catch (e: any) {
      setError({ error: e.message });
    } finally {
      setLoading(false);
    }
  };

  const handleListSaleItems = async () => {
    clearState();
    setLoading(true);

    try {
      const queryParams = new URLSearchParams({
        page: currentPage.toString(),
        limit: pageSize.toString(),
        ...(formData.searchKeyword && { keyword: formData.searchKeyword }),
        ...(selectedSalesType && { sales_type: selectedSalesType.toString() }),
        ...(selectedStatus && { status: selectedStatus.toString() }),
      });

      const response = await fetch(`/api/v1/saleitems?${queryParams.toString()}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || '판매 아이템 목록 조회 실패');
      }

      setListResponse(data);
    } catch (e: any) {
      setError({ error: e.message });
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    handleListSaleItems();
  };

  const handleSearch = () => {
    setCurrentPage(1);
    handleListSaleItems();
  };
  
  // 진료과에 따른 장비 타입 필터링
  const filteredDeviceTypes = formData.department
    ? departments
        .find(d => d.id.toString() === formData.department)
        ?.deviceTypes || []
    : [];

  console.log('Current state:', {
    selectedDepartment: formData.department,
    departments,
    filteredDeviceTypes,
  });

  // 진료과가 변경되면 장비 타입 선택 초기화
  useEffect(() => {
    if (formData.department) {
      console.log('Department changed in useEffect, resetting equipment type');
      setFormData(prev => ({ ...prev, equipmentType: '' }));
    }
  }, [formData.department]);

  return (
    <PageLayout title="Client API Test: SaleItems">
      <Card title="인증 토큰 (선행 필요)">
        <p className="text-sm text-gray-600 mb-2">
          이 페이지의 기능을 사용하려면, 먼저 'Client API Test: Auth' 페이지에서 Check-in을 완료하고 받은 JWT 토큰이 필요합니다.
        </p>
        <Input
          type="text"
          value={authToken}
          onChange={(e) => setAuthToken(e.target.value)}
          placeholder="Auth 페이지에서 복사한 토큰을 여기에 붙여넣으세요"
        />
      </Card>

      <Card title="1. 판매 아이템 생성 (POST /api/v1/saleitems)">
        <form onSubmit={handleCreateSaleItem} className="space-y-4">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">판매유형</label>
              <select
                name="salesType"
                value={formData.salesType}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
              >
                <option value="">판매유형 선택</option>
                {salesTypes.map(st => <option key={st.id} value={st.id}>{st.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">담당자 이름</label>
              <Input name="name" value={formData.name} onChange={handleInputChange} placeholder="담당자 이름" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">담당자 연락처</label>
              <Input name="phone" value={formData.phone} onChange={handleInputChange} placeholder="담당자 연락처" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">병원/기관명</label>
              <Input name="hospitalName" value={formData.hospitalName} onChange={handleInputChange} placeholder="병원/기관명" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">소재지</label>
              <Input name="location" value={formData.location} onChange={handleInputChange} placeholder="소재지" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">진료과</label>
              <select 
                name="department" 
                value={formData.department} 
                onChange={handleInputChange} 
                className="w-full p-2 border rounded"
              >
                <option value="">진료과 선택</option>
                {departments.map(d => <option key={d.id} value={d.id.toString()}>{d.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">장비 타입</label>
              <select 
                name="equipmentType" 
                value={formData.equipmentType} 
                onChange={handleInputChange} 
                className="w-full p-2 border rounded"
                disabled={!formData.department}
              >
                <option value="">장비 타입 선택</option>
                {filteredDeviceTypes.map(t => <option key={t.id} value={t.id.toString()}>{t.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">제조사</label>
              <select name="manufacturer" value={formData.manufacturer} onChange={handleInputChange} className="w-full p-2 border rounded">
                <option value="">제조사 선택</option>
                {manufacturers.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">제조년도</label>
              <Input name="manufacturingYear" value={formData.manufacturingYear} onChange={handleInputChange} placeholder="제조년도" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">특이사항 (설명)</label>
              <textarea name="description" value={formData.description} onChange={handleInputChange} placeholder="특이사항 (설명)" className="w-full p-2 border rounded" />
            </div>
          </div>
          <Button 
            type="submit" 
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded disabled:bg-gray-400" 
            disabled={!authToken || loading}
          >
            {loading ? '처리 중...' : '판매 아이템 생성'}
          </Button>
        </form>
        <ResultDisplay type="success" title="성공:" data={createResponse} />
      </Card>

      <Card title="2. 판매 아이템 목록 조회 (GET /api/v1/saleitems)">
        <div className="space-y-4 mb-4">
          <div className="flex gap-2">
            <Input
              type="text"
              value={formData.searchKeyword}
              onChange={(e) => setFormData(prev => ({ ...prev, searchKeyword: e.target.value }))}
              placeholder="검색어 입력"
              className="flex-1"
            />
            <select
              value={selectedSalesType?.toString() || ''}
              onChange={(e) => setSelectedSalesType(e.target.value ? Number(e.target.value) : undefined)}
              className="w-full p-2 border rounded"
            >
              <option value="">판매유형 선택</option>
              {salesTypes.map(st => <option key={st.id} value={st.id}>{st.name}</option>)}
            </select>
            <select
              value={selectedStatus || ''}
              onChange={(e) => setSelectedStatus(e.target.value ? Number(e.target.value) : undefined)}
              className="w-32 p-2 border rounded"
            >
              <option value="">상태</option>
              <option value="0">비활성</option>
              <option value="1">활성</option>
            </select>
            <Button onClick={handleSearch} className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded">
              검색
            </Button>
          </div>
        </div>
        
        {listResponse && (
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span>총 {listResponse.total}개 항목</span>
              <div className="flex gap-2">
                <Button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded disabled:bg-gray-300"
                >
                  이전
                </Button>
                <span className="px-2 py-1">
                  {currentPage} / {listResponse.totalPages}
                </span>
                <Button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === listResponse.totalPages}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded disabled:bg-gray-300"
                >
                  다음
                </Button>
              </div>
            </div>
          </div>
        )}

        <ResultDisplay type="info" title="조회 결과:" data={listResponse} />
      </Card>

      {error && (
        <Card title="오류 발생">
          <ResultDisplay type="error" title="" data={error.error} />
        </Card>
      )}
    </PageLayout>
  );
} 