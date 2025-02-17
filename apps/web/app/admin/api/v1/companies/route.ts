import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const data = await request.json();

    const company = await prisma.company.create({
      data: {
        name: data.name,
        business_no: data.business_no,
        business_tel: data.business_tel,
        business_mobile: data.business_mobile,
        company_type: data.company_type,
        zipcode: data.zipcode,
        address: data.address,
        address_detail: data.address_detail
      }
    });

    return NextResponse.json(company);
  } catch (error) {
    console.error('업체 등록 중 오류:', error);
    return NextResponse.json(
      { error: '업체 등록 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}