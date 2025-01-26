import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

function hashPassword(password: string, salt: string): string {
  return Buffer.from(crypto.createHash('sha512').update(password + salt).digest()).toString('base64');
}

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    // 이미 존재하는 username 체크
    const existingAdmin = await prisma.admin.findUnique({
      where: { username }
    });

    if (existingAdmin) {
      return NextResponse.json(
        { error: '이미 존재하는 사용자명입니다.' },
        { status: 400 }
      );
    }

    console.log(username, password);
    console.log(hashPassword(password, 'your_salt_value'));

    const admin = await prisma.admin.create({
      data: {
        username,
        password: hashPassword(password, 'your_salt_value')
      }
    });

    return NextResponse.json({
      success: true,
      admin: {
        id: admin.id,
        username: admin.username
      }
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: '계정 생성 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}