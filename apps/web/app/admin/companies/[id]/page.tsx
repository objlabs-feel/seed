'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import CompanyRegisterForm from '../../products/components/CompanyRegisterForm'

interface Company {
  id: number
  name: string
  business_no: string
  business_tel: string
  business_mobile: string | null
  company_type: number
  zipcode: string | null
  address: string | null
  adddress_detail: string | null
  profile?: {
    name: string
    email: string
    mobile: string
  }
}

export default function CompanyDetail({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [company, setCompany] = useState<Company | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchCompany()
  }, [params.id])

  const fetchCompany = async () => {
    try {
      const response = await fetch(`/api/v1/companies/${params.id}`)
      const data = await response.json()
      setCompany(data)
    } catch (err) {
      setError('업체 정보를 불러오는데 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdate = async (updatedData: any) => {
    try {
      const response = await fetch(`/api/v1/companies/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedData),
      })

      if (response.ok) {
        alert('업체 정보가 수정되었습니다.')
        router.push('/admin/companies')
      } else {
        throw new Error('수정 중 오류가 발생했습니다.')
      }
    } catch (err) {
      alert('업체 정보 수정 중 오류가 발생했습니다.')
    }
  }

  if (loading) return <div>로딩 중...</div>
  if (error) return <div className="text-red-500">{error}</div>
  if (!company) return <div>업체를 찾을 수 없습니다.</div>

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold mb-6">업체 정보 수정</h2>
      <CompanyRegisterForm
        initialData={company}
        onSubmit={handleUpdate}
        onCancel={() => router.back()}
      />
    </div>
  )
} 