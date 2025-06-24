'use client';

import { useState, useEffect } from 'react';
import { Manufacturer } from '@repo/shared/models';

export default function ManufacturerManagement() {
  const [manufacturers, setManufacturers] = useState<Manufacturer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingManufacturer, setEditingManufacturer] = useState<Manufacturer | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });

  useEffect(() => {
    fetchManufacturers();
  }, []);

  const fetchManufacturers = async () => {
    try {
      const response = await fetch('/admin/api/v1/manufacturers');
      const data = await response.json();
      setManufacturers(data);
    } catch (err) {
      setError('제조사 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/admin/api/v1/manufacturers' + (editingManufacturer ? `/${editingManufacturer.id}` : ''), {
        method: editingManufacturer ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        fetchManufacturers();
        setShowForm(false);
        setEditingManufacturer(null);
        setFormData({ name: '', description: '' });
      }
    } catch (err) {
      alert('저장 중 오류가 발생했습니다.');
    }
  };

  const handleEdit = (manufacturer: Manufacturer) => {
    setEditingManufacturer(manufacturer);
    setFormData({
      name: manufacturer.name || '',
      description: manufacturer.description || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;

    try {
      const response = await fetch(`/admin/api/v1/manufacturers/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        fetchManufacturers();
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
        <h2 className="text-lg font-semibold">제조사 관리</h2>
        <button
          onClick={() => {
            setShowForm(true);
            setEditingManufacturer(null);
            setFormData({ name: '', description: '' });
          }}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          신규 등록
        </button>
      </div>

      {showForm && (
        <div className="mb-6 p-4 border rounded">
          <h3 className="text-lg font-medium mb-4">
            {editingManufacturer ? '제조사 수정' : '제조사 등록'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
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
            <th className="p-4 text-left">이름</th>
            <th className="p-4 text-left">설명</th>
            <th className="p-4 text-left">작업</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {manufacturers.map((manufacturer) => (
            <tr key={manufacturer.id}>
              <td className="p-4">{manufacturer.name}</td>
              <td className="p-4">{manufacturer.description}</td>
              <td className="p-4">
                <button
                  onClick={() => handleEdit(manufacturer)}
                  className="text-blue-500 hover:text-blue-700 mr-2"
                >
                  수정
                </button>
                <button
                  onClick={() => handleDelete(manufacturer.id as number)}
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