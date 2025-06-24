'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@repo/ui/button';
import { Department } from '@repo/shared/models';
import { Modal } from '@/components/ui/Modal';
import { DepartmentForm } from './DepartmentForm';

// 다크모드 호환 버튼 스타일 정의
const editButtonClasses = "bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 text-sm py-1 px-2 rounded border border-gray-300 dark:border-gray-500";
const deleteButtonClasses = "bg-red-100 hover:bg-red-200 dark:bg-red-900 dark:hover:bg-red-800 text-red-800 dark:text-red-100 text-sm py-1 px-2 rounded border border-red-300 dark:border-red-600";

interface DepartmentsTabProps {
  token: string | null;
}

const API_ENDPOINT = '/admin/api/v1/departments';

export default function DepartmentsTab({ token }: DepartmentsTabProps) {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<Partial<Department> | null>(null);

  const fetchDepartments = useCallback(async () => {
    if (!token) {
      // 이 컴포넌트가 렌더링될 때는 항상 토큰이 존재해야 함 (Layout에서 처리)
      // 만약의 경우를 대비해 에러를 표시하거나 아무것도 하지 않음
      setError('인증 토큰이 없습니다. 페이지를 새로고침해주세요.');
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(API_ENDPOINT, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('데이터를 불러오는데 실패했습니다.');
      const data = await response.json();
      setDepartments(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchDepartments();
  }, [fetchDepartments]);

  const handleOpenCreateModal = () => {
    setEditingDepartment({});
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (department: Department) => {
    setEditingDepartment(department);
    setIsModalOpen(true);
  };
  
  const handleCloseModal = () => {
    setEditingDepartment(null);
    setIsModalOpen(false);
  };
  
  const handleSave = async (departmentData: Partial<Department>) => {
    if (!token) return;
    
    const isCreating = !departmentData.id;
    const url = isCreating ? API_ENDPOINT : `${API_ENDPOINT}/${departmentData.id}`;
    const method = isCreating ? 'POST' : 'PUT';

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(departmentData),
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || '저장에 실패했습니다.');
      }
      handleCloseModal();
      fetchDepartments(); // 목록 새로고침
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('정말로 삭제하시겠습니까?') || !token) return;

    try {
      const response = await fetch(`${API_ENDPOINT}/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error('삭제에 실패했습니다.');
      fetchDepartments();
    } catch (e: any) {
      alert(e.message);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div>
      <div className="flex justify-end mb-4">
        <Button 
          onClick={handleOpenCreateModal}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          진료과 추가
        </Button>
      </div>
      <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-800">
          <tr>
            <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 dark:text-white sm:pl-6">ID</th>
            <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">Name</th>
            <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">Code</th>
            <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">Description</th>
            <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">Sort Key</th>
            <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">Status</th>
            <th className="relative py-3.5 pl-3 pr-4 sm:pr-6">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-gray-800 bg-white dark:bg-gray-900">
          {departments.map((dept) => (
            <tr key={dept.id}>
              <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 dark:text-white sm:pl-6">{dept.id}</td>
              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-600 dark:text-gray-300">{dept.name}</td>
              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-600 dark:text-gray-300">{dept.code}</td>
              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-600 dark:text-gray-300">{dept.description}</td>
              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-600 dark:text-gray-300">{dept.sort_key}</td>
              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-600 dark:text-gray-300">{dept.status}</td>
              <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                <Button onClick={() => handleOpenEditModal(dept)} className={`${editButtonClasses} mr-2`}>
                  수정
                </Button>
                <Button onClick={() => handleDelete(Number(dept.id))} className={deleteButtonClasses}>
                  삭제
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      <Modal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal}
        title={editingDepartment?.id ? '진료과 수정' : '진료과 생성'}
      >
        <DepartmentForm 
          department={editingDepartment}
          onSave={handleSave}
          onCancel={handleCloseModal}
        />
      </Modal>
    </div>
  );
} 