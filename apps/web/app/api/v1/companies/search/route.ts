import { NextResponse } from 'next/server';
import { prisma } from '@repo/shared';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const name = searchParams.get('name');
    const business_no = searchParams.get('business_no');
    const company_type = searchParams.get('company_type') ?
      parseInt(searchParams.get('company_type') || '0') : undefined;
    const profile_name = searchParams.get('profile_name');

    const skip = (page - 1) * limit;

    const where = {
      ...(name && {
        name: {
          contains: name
        }
      }),
      ...(business_no && {
        business_no: {
          contains: business_no
        }
      }),
      ...(company_type !== undefined && { company_type }),
      ...(profile_name && {
        profiles: {
          some: {
            name: {
              contains: profile_name
            }
          }
        }
      })
    };

    const [companies, total] = await Promise.all([
      prisma.company.findMany({
        where,
        include: {
          profile: {
            take: 1
          }
        },
        skip,
        take: limit,
        orderBy: {
          created_at: 'desc'
        }
      }),
      prisma.company.count({ where })
    ]);

    return NextResponse.json({
      companies,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      hasMore: skip + companies.length < total
    });
  } catch (error) {
    console.error('업체 목록 조회 중 오류:', error);
    return NextResponse.json(
      { error: '업체 목록 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}