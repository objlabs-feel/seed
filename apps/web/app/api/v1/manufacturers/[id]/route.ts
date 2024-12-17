import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id)
    const data = await request.json()
    const manufacturer = await prisma.manufacturer.update({
      where: { id },
      data: {
        name: data.name,
        device_types: JSON.stringify(data.device_types),
        description: data.description
      }
    })
    return NextResponse.json(manufacturer)
  } catch (error) {
    return NextResponse.json(
      { error: '제조사 수정 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id)
    await prisma.manufacturer.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: '제조사 삭제 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
} 