'use client'

import { useRouter } from 'next/navigation'

export default function Settings() {
  const router = useRouter()

  const menuItems = [
    {
      title: '진료과 관리',
      description: '병원 진료과 코드를 관리합니다.',
      path: '/admin/settings/departments'
    },
    {
      title: '장비 종류 관리',
      description: '의료 장비 종류 코드를 관리합니다.',
      path: '/admin/settings/device-types'
    },
    {
      title: '제조사 관리',
      description: '의료 장비 제조사 정보를 관리합니다.',
      path: '/admin/settings/manufacturers'
    }
  ]

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold mb-6">시스템 설정</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {menuItems.map((item) => (
          <div
            key={item.path}
            className="p-6 border rounded-lg hover:border-blue-500 cursor-pointer"
            onClick={() => router.push(item.path)}
          >
            <h3 className="text-lg font-medium mb-2">{item.title}</h3>
            <p className="text-gray-600">{item.description}</p>
          </div>
        ))}
      </div>
    </div>
  )
} 