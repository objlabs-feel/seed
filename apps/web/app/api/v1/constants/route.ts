import { NextResponse } from 'next/server';
import {
  departmentService,
  deviceTypeService,
  manufacturerService,
} from '@repo/shared/services';
import { createApiResponse, withApiHandler } from '@/libs/api-utils';
import { createSystemError } from '@/libs/errors';
import type { ApiResponse } from '@/types/api';
import { convertBigIntToString } from '@/libs/utils';

export const GET = withApiHandler(async (request: Request): Promise<ApiResponse> => {
  try {
    // 요청 헤더 로깅
    console.log('Request headers:', Object.fromEntries(request.headers.entries()));

    const [departments, deviceTypes, manufacturers] = await Promise.all([
      departmentService.findMany({
        where: {
          status: 1,
          deviceTypes: {
            some: {
              status: 1,
            },
          },
        },
        select: {
          id: true,
          name: true,
          code: true,
          sort_key: true,
          deviceTypes: {
            select: {
              device_type_id: true,
              sort_key: true,
              status: true,
              deviceType: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
        orderBy: {
          sort_key: 'asc',
        }
      }),
      deviceTypeService.findMany({
        select: {
          id: true,
          name: true,
          code: true,
          sort_key: true,
        },
        orderBy: {
          sort_key: 'asc',
        },
      }),
      manufacturerService.findMany({
        select: {
          id: true,
          name: true,
        },
        orderBy: {
          name: 'asc',
        },
      }),
    ]);

    // BigInt 또는 number를 string으로 변환
    // const stringifyId = (item: { id: bigint | number, [key: string]: any }) => ({
    //   ...item,
    //   id: item.id.toString(),
    // });

    // console.log('Response data:', {
    //   departments: departments.map(stringifyId),
    //   deviceTypes: deviceTypes.map(stringifyId),
    //   manufacturers: manufacturers.map(stringifyId),
    // });

    console.log('Response data:', {
      departments: departments,
      deviceTypes: deviceTypes,
      manufacturers: manufacturers,
    });

    return {
      success: true,
      data: {
        departments: convertBigIntToString(departments),
        deviceTypes: convertBigIntToString(deviceTypes),
        manufacturers: convertBigIntToString(manufacturers),
      }
    };
  } catch (error) {
    console.error('상수 데이터 조회 중 오류:', error);
    throw createSystemError('INTERNAL_ERROR', 'Failed to fetch constants data');
  }
});
