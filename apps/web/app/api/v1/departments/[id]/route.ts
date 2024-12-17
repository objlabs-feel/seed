import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// 수정
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id)
    const data = await request.json()
    const department = await prisma.department.update({
      where: { id },
      data
    })
    return NextResponse.json(department)
  } catch (error) {
    return NextResponse.json(
      { error: '진료과 수정 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

// 삭제
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id)
    await prisma.department.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: '진료과 삭제 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
} 