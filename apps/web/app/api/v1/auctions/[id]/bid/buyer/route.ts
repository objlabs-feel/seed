import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { convertBigIntToString } from '@/lib/utils';
import { authenticateUser } from '@/lib/auth';
import { AuctionStatus, ICompany, IProfile } from '@repo/shared/models';

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const auth = await authenticateUser(request);
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  const { userId } = auth;

  const auctionItemId = parseInt(params.id);
  const {
    visitDate,
    visitTime
  } = await request.json();

  console.log(visitDate, visitTime);

  const auctionItem = await prisma.auctionItem.findUnique({
    where: {
      id: auctionItemId
    }
  });

  if (!auctionItem) {
    return NextResponse.json({ error: '경매 상품을 찾을 수 없습니다.' }, { status: 404 });
  }

  if (auctionItem.status !== AuctionStatus.SUCCESS_BID) {
    return NextResponse.json({ error: '경매 상품이 진행중이 아닙니다.' }, { status: 400 });
  }

  if (auctionItem.buyer_steps !== 2) {
    return NextResponse.json({ error: '경매 상품이 진행중이 아닙니다.' }, { status: 400 });
  }

  if (auctionItem.seller_steps !== 2) {
    return NextResponse.json({ error: '경매 상품이 진행중이 아닙니다.' }, { status: 400 });
  }

  const updatedAuctionItem = await prisma.auctionItem.update({
    where: { id: auctionItem.id },
    data: {
      visit_date: new Date(visitDate),
      visit_time: visitTime,
      seller_steps: 2,
      buyer_steps: 3
    }
  });

  return NextResponse.json(convertBigIntToString(updatedAuctionItem));
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const auth = await authenticateUser(request);
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  const { userId } = auth;

  try {
    const auctionItemId = parseInt(params.id);
    const {
      companyName,
      address,
      addressDetail,
      zipCode,
      ownerName,
      ownerEmail,
      ownerMobile,
      businessNo } = await request.json();

    let user = await prisma.user.findUnique({
      where: {
        id: BigInt(userId as string)
      }
    });

    if (!user) {
      return NextResponse.json({ error: '사용자를 찾을 수 없습니다.' }, { status: 404 });
    }

    let profile: IProfile = {}

    if (!user.profile_id) {
      profile = await prisma.profile.create({
        data: {
          name: ownerName,
          email: ownerEmail,
          mobile: ownerMobile
        }
      });
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          profile_id: profile.id
        }
      });
    } else {
      profile = await prisma.profile.findUnique({
        where: {
          id: user.profile_id
        }
      });
    }

    let company: ICompany = {}

    if (!profile.company_id) {
      company = await prisma.company.create({
        data: {
          owner_id: profile.id,
          name: companyName,
          address: address,
          address_detail: addressDetail,
          zipcode: zipCode,
          business_no: businessNo,
          business_mobile: ownerMobile
        }
      });
      profile = await prisma.profile.update({
        where: { id: profile.id },
        data: {
          company_id: company.id
        }
      });
    }

    if (!company) {
      return NextResponse.json({ error: '회사를 찾을 수 없습니다.' }, { status: 404 });
    }

    company.name = companyName;
    company.address = address;
    company.address_detail = addressDetail;
    company.zipcode = zipCode;
    company.business_no = businessNo;
    company.business_mobile = ownerMobile;
    profile.name = ownerName;
    profile.email = ownerEmail;
    profile.mobile = ownerMobile;
    company.secret_info = { bankAccount: '', bankCode: '', bankHolder: '', businessEmail: ownerEmail, businessNo, businessTel: '', businessMobile: ownerMobile }

    const auctionItem = await prisma.auctionItem.findUnique({
      where: {
        id: auctionItemId
      }
    });

    if (!auctionItem) {
      return NextResponse.json({ error: '경매 상품을 찾을 수 없습니다.' }, { status: 404 });
    }

    auctionItem.seller_steps = 2;
    auctionItem.buyer_steps = 2;

    const tx = await prisma.$transaction([
      prisma.profile.update({
        where: { id: profile.id },
        data: profile
      }),
      prisma.company.update({
        where: { id: company.id },
        data: company
      }),
      prisma.auctionItem.update({
        where: { id: auctionItem.id },
        data: auctionItem
      })
    ]);

    return NextResponse.json(convertBigIntToString(auctionItem));
  } catch (error) {
    console.error('입찰 처리 중 오류:', error);
    return NextResponse.json(
      { error: '입찰 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}