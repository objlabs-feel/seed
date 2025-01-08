import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

function replacer(key: string, value: any) {
  if (typeof value === 'bigint') {
    return value.toString();
  }
  return value;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const status = searchParams.get('status') ? parseInt(searchParams.get('status') || '0') : undefined
    const profile_name = searchParams.get('profile_name')
    const email = searchParams.get('email')
    const mobile = searchParams.get('mobile')

    const skip = (page - 1) * limit

    const where = {
      ...(status !== undefined && { status }),
      ...(profile_name && {
        profile: {
          name: {
            contains: profile_name
          }
        }
      }),
      ...(email && {
        profile: {
          email: {
            contains: email
          }
        }
      }),
      ...(mobile && {
        profile: {
          mobile: {
            contains: mobile
          }
        }
      })
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        include: {
          profile: true
        },
        skip,
        take: limit,
        orderBy: {
          created_at: 'desc'
        }
      }),
      prisma.user.count({ where })
    ])

    // BigInt를 문자열로 변환
    const responseUsers = users.map(user => ({
        ...user,
        id: user.id.toString(), // BigInt 필드를 문자열로 변환
        profile_id: user.profile_id ? user.profile_id.toString() : null
    }))

    return NextResponse.json({
      users: responseUsers,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      hasMore: skip + users.length < total
    })
  } catch (error) {
    console.error('이용자 목록 조회 중 오류:', error)
    return NextResponse.json(
      { error: '이용자 목록 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json()
    const newUser = await prisma.user.create({
      data: {
        // 필요한 필드에 따라 데이터를 설정합니다.
        device_token: data.device_token || '',
        profile_id: (data.name || data.email || data.mobile) ? (await prisma.profile.create({
          data: {
            name: data.name,
            email: data.email,
            mobile: data.mobile,
            profile_type: data.profile_type || 0,
          }
        })).id : undefined,
        status: data.status || 0,
      }
    })

    // BigInt를 문자열로 변환
    const responseUser = {
        ...newUser,
        id: newUser.id.toString(), // BigInt 필드를 문자열로 변환
        profile_id: newUser.profile_id ? newUser.profile_id.toString() : null
    }

    return NextResponse.json(responseUser, { status: 201 })
  } catch (error) {
    console.error('이용자 생성 중 오류:', error)
    return NextResponse.json(
      { error: '이용자 생성 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
} 