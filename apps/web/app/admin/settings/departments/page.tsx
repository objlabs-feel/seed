'use client';

import { useState, useEffect } from 'react';

interface Department {
  id: number
  code: string
  name: string
  description: string | null
  img: string | null
}

export default function DepartmentManagement() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: ''
  });

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const response = await fetch('/api/v1/departments');
      const data = await response.json();
      setDepartments(data);
    } catch (err) {
      setError('진료과 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/v1/departments' + (editingDepartment ? `/${editingDepartment.id}` : ''), {
        method: editingDepartment ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        fetchDepartments();
        setShowForm(false);
        setEditingDepartment(null);
        setFormData({ code: '', name: '', description: '' });
      }
    } catch (err) {
      alert('저장 중 오류가 발생했습니다.');
    }
  };

  const handleEdit = (department: Department) => {
    setEditingDepartment(department);
    setFormData({
      code: department.code || '',
      name: department.name || '',
      description: department.description || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;

    try {
      const response = await fetch(`/api/v1/departments/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        fetchDepartments();
      }
    } catch (err) {
      alert('삭제 중 오류가 발생했습니다.');
    }
  };

  if (loading) return <div>로딩 중...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold">진료과 관리</h2>
        <button
          onClick={() => {
            setShowForm(true);
            setEditingDepartment(null);
            setFormData({ code: '', name: '', description: '' });
          }}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          신규 등록
        </button>
      </div>

      {showForm && (
        <div className="mb-6 p-4 border rounded">
          <h3 className="text-lg font-medium mb-4">
            {editingDepartment ? '진료과 수정' : '진료과 등록'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">코드</label>
              <input
                type="text"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                className="w-full p-2 border rounded"
                required
                maxLength={2}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">이름</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full p-2 border rounded"
                required
              />
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
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowForm(false)}
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
      )}

      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="p-4 text-left">코드</th>
            <th className="p-4 text-left">이름</th>
            <th className="p-4 text-left">설명</th>
            <th className="p-4 text-left">작업</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {departments.map((department) => (
            <tr key={department.id}>
              <td className="p-4">{department.code}</td>
              <td className="p-4">{department.name}</td>
              <td className="p-4">{department.description}</td>
              <td className="p-4">
                <button
                  onClick={() => handleEdit(department)}
                  className="text-blue-500 hover:text-blue-700 mr-2"
                >
                  수정
                </button>
                <button
                  onClick={() => handleDelete(department.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  삭제
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}