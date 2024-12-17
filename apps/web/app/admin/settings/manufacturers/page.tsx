'use client'

import { useState, useEffect } from 'react'

interface DeviceType {
  id: number
  code: string
  name: string
}

interface Manufacturer {
  id: number
  name: string
  device_types: string  // JSON 문자열로 저장된 장비 종류 ID 배열
  img: string | null
  description: string | null
}

export default function ManufacturerManagement() {
  const [manufacturers, setManufacturers] = useState<Manufacturer[]>([])
  const [deviceTypes, setDeviceTypes] = useState<DeviceType[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editingManufacturer, setEditingManufacturer] = useState<Manufacturer | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    device_types: [] as number[],
    description: '',
    department_id: null as number | null,
  })

  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true)
        const [manufacturersRes, deviceTypesRes] = await Promise.all([
          fetch('/api/v1/manufacturers'),
          fetch('/api/v1/device-types')
        ])

        const manufacturersData = await manufacturersRes.json()
        const deviceTypesData = await deviceTypesRes.json()

        setManufacturers(manufacturersData)
        setDeviceTypes(deviceTypesData)
      } catch (err) {
        setError('데이터를 불러오는데 실패했습니다.')
      } finally {
        setLoading(false)
      }
    }

    init()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/v1/manufacturers' + (editingManufacturer ? `/${editingManufacturer.id}` : ''), {
        method: editingManufacturer ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        fetchManufacturers()
        setShowForm(false)
        setEditingManufacturer(null)
        setFormData({ name: '', device_types: [], description: '', department_id: null })
      }
    } catch (err) {
      alert('저장 중 오류가 발생했습니다.')
    }
  }

  const handleEdit = (manufacturer: Manufacturer) => {
    setEditingManufacturer(manufacturer)
    setFormData({
      name: manufacturer.name || '',
      device_types: JSON.parse(manufacturer.device_types || '[]'),  // JSON 문자열을 배열로 파싱
      description: manufacturer.description || '',
      department_id: null,
    })
    setShowForm(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('정말 삭제하시겠습니까?')) return

    try {
      const response = await fetch(`/api/v1/manufacturers/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        fetchManufacturers()
      }
    } catch (err) {
      alert('삭제 중 오류가 발생했습니다.')
    }
  }

  const handleDeviceTypeChange = (deviceTypeId: number) => {
    setFormData(prev => {
      const newDeviceTypes = prev.device_types.includes(deviceTypeId)
        ? prev.device_types.filter(id => id !== deviceTypeId)
        : [...prev.device_types, deviceTypeId]
      return { ...prev, device_types: newDeviceTypes }
    })
  }

  const getDeviceTypeNames = (deviceTypeIds: string) => {
    try {
      const ids = JSON.parse(deviceTypeIds || '[]') as number[]
      return ids
        .map(id => deviceTypes.find(dt => dt.id === id)?.name)
        .filter(Boolean)
        .join(', ')
    } catch {
      return ''
    }
  }

  if (loading) return <div>로딩 중...</div>
  if (error) return <div className="text-red-500">{error}</div>

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold">제조사 관리</h2>
        <button
          onClick={() => {
            setShowForm(true)
            setEditingManufacturer(null)
            setFormData({ name: '', device_types: [], description: '', department_id: null })
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
              <label className="block text-sm font-medium mb-1">제조사명</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">취급 장비</label>
              {deviceTypes.length > 0 ? (
                <div className="space-y-2">
                  {deviceTypes.map(deviceType => (
                    <label key={deviceType.id} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.device_types.includes(deviceType.id)}
                        onChange={() => handleDeviceTypeChange(deviceType.id)}
                        className="mr-2"
                      />
                      {deviceType.name}
                    </label>
                  ))}
                </div>
              ) : (
                <div className="p-4 text-gray-500 text-center border rounded">
                  취급 가능한 장비 없음
                </div>
              )}
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
            <div>
              <label className="block text-sm font-medium mb-1">진료과 선택</label>
              <select
                value={formData.department_id || ''}
                onChange={(e) => setFormData({ ...formData, department_id: Number(e.target.value) })}
                className="w-full p-2 border rounded"
                required
              >
                <option value="" disabled>진료과 선택</option>
                {deviceTypes.map(deviceType => (
                  <option key={deviceType.id} value={deviceType.id}>
                    {deviceType.name}
                  </option>
                ))}
              </select>
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
            <th className="p-4 text-left">제조사명</th>
            <th className="p-4 text-left">취급 장비</th>
            <th className="p-4 text-left">설명</th>
            <th className="p-4 text-left">작업</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {manufacturers.map((manufacturer) => (
            <tr key={manufacturer.id}>
              <td className="p-4">{manufacturer.name}</td>
              <td className="p-4">{getDeviceTypeNames(manufacturer.device_types)}</td>
              <td className="p-4">{manufacturer.description}</td>
              <td className="p-4">
                <button
                  onClick={() => handleEdit(manufacturer)}
                  className="text-blue-500 hover:text-blue-700 mr-2"
                >
                  수정
                </button>
                <button
                  onClick={() => handleDelete(manufacturer.id)}
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
  )
} 