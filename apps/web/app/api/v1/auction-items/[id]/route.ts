import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// 경매 상품 수정
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id)
    const body = await request.json()
    
    const {
      medicalDevice: deviceData,
      auctionCode,
      status,
      startTimestamp,
      expiredCount
    } = body

    // 트랜잭션으로 medical_device와 auction_item 동시 수정
    const result = await prisma.$transaction(async (tx) => {
      // 1. auction_item 조회
      const auctionItem = await tx.auctionItem.findUnique({
        where: { id },
        include: {
          medicalDevice: true
        }
      })

      if (!auctionItem) {
        throw new Error('존재하지 않는 경매 상품입니다.')
      }

      // 2. medical_device 수정
      if (deviceData) {
        await tx.medicalDevice.update({
          where: { id: auctionItem.medicalDevice.id },
          data: {
            company_id: deviceData.company_id,
            department: deviceData.department,
            device_type: deviceData.device_type,
            manufacturer_id: deviceData.manufacturer_id,
            manufacture_date: deviceData.manufacture_date,
            images: deviceData.images,
            description: deviceData.description
          }
        })
      }

      // 3. auction_item 수정
      const updatedAuctionItem = await tx.auctionItem.update({
        where: { id },
        data: {
          auction_code: auctionCode,
          status,
          start_timestamp: startTimestamp,
          expired_count: expiredCount
        },
        include: {
          medicalDevice: true
        }
      })

      return updatedAuctionItem
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('경매 상품 수정 중 오류:', error)
    return NextResponse.json(
      { error: '경매 상품 수정 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

// GET 메서드 추가
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id)
    
    const auctionItem = await prisma.auctionItem.findUnique({
      where: { id },
      include: {
        medicalDevice: true
      }
    })

    if (!auctionItem) {
      return NextResponse.json(
        { error: '존재하지 않는 경매 상품입니다.' },
        { status: 404 }
      )
    }

    return NextResponse.json(auctionItem)
  } catch (error) {
    console.error('경매 상품 조회 중 오류:', error)
    return NextResponse.json(
      { error: '경매 상품 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
} 