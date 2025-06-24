import { NextResponse } from 'next/server';
import { updateExpiredAuctions, updateExpiredValidAuctions } from '@/libs/schedule/auction';
import { createApiResponse, withApiHandler } from '@/libs/api-utils';
import type { ApiResponse } from '@/types/api';

export async function GET(request: Request) {
  try {
    // API 키 확인
    const { searchParams } = new URL(request.url);
    const apiKey = searchParams.get('apiKey');

    if (apiKey !== process.env.API_SECRET_KEY) {
      return NextResponse.json({ error: '인증 실패' }, { status: 401 });
    }

    // 두 종류의 경매 상태 업데이트를 순차적으로 실행
    const [expiredResult, revertedResult] = await Promise.all([
      updateExpiredAuctions(),
      updateExpiredValidAuctions(),
    ]);

    const totalUpdated = expiredResult.updatedCount + revertedResult.updatedCount;

    // 결과 로깅
    console.log(`만료 처리: ${expiredResult.updatedCount}개, 미확정 유찰 처리: ${revertedResult.updatedCount}개`);
    console.log(`업데이트 완료: 총 ${totalUpdated}개 경매 상품 처리됨`);

    return NextResponse.json({
      success: true,
      updated: {
        expired: expiredResult.updatedCount,
        reverted: revertedResult.updatedCount,
        total: totalUpdated,
      },
      message: '경매 상품 상태 업데이트 완료'
    });
  } catch (error) {
    console.error('경매 스케줄링 작업 중 오류:', error);
    return NextResponse.json({
      error: '경매 업데이트 중 오류가 발생했습니다.'
    }, { status: 500 });
  }
}