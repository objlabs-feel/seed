import { NextResponse } from 'next/server';
import { prisma } from '@repo/shared';

export async function POST() {
  try {
    const departments = [
      { id: 1, code: 'HS', name: '검진센터', description: 'Health Screening' },
      { id: 2, code: 'IM', name: '내과', description: 'Internal Medicine' },
      { id: 3, code: 'GS', name: '외과', description: 'General Surgery' },
      { id: 4, code: 'OS', name: '정형외과', description: 'Orthopedic Surgery' },
      { id: 5, code: 'RM', name: '재활의학과', description: 'Rehabilitation Medicine' },
      { id: 6, code: 'NS', name: '신경외과', description: 'Neurosurgery' },
      { id: 7, code: 'ET', name: '이비인후과', description: 'Ear, Nose, and Throat' },
      { id: 8, code: 'PS', name: '성형외과', description: 'Plastic Surgery' },
      { id: 9, code: 'DM', name: '피부과', description: 'Dermatology' },
      { id: 10, code: 'PD', name: '소아청소년과', description: 'Pediatrics' },
      { id: 11, code: 'RD', name: '방사선과', description: 'Radiology' },
      { id: 12, code: 'UR', name: '비뇨기과', description: 'Urology' },
      { id: 13, code: 'OB', name: '산부인과', description: 'Obstetrics and Gynecology' },
      { id: 14, code: 'BS', name: '유방외과', description: 'Breast Surgery' },
      { id: 15, code: 'FM', name: '가정의학과', description: 'Family Medicine' },
      { id: 16, code: 'OP', name: '안과', description: 'Ophthalmology' },
      { id: 17, code: 'OM', name: '한방병원', description: 'Oriental Medicine' },
      { id: 18, code: 'DT', name: '치과', description: 'Dentistry' },
      { id: 19, code: 'VH', name: '수의과', description: 'Veterinary Hospital' },
      { id: 20, code: 'OT', name: '기타', description: 'Others' }
    ];

    const result = await prisma.department.createMany({
      data: departments,
      skipDuplicates: true
    });

    return NextResponse.json({
      success: true,
      count: result.count,
      message: `${result.count}개의 진료과가 등록되었습니다.`
    });
  } catch (error) {
    console.error('진료과 샘플 데이터 등록 중 오류:', error);
    return NextResponse.json(
      { error: '진료과 샘플 데이터 등록 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}