import { NextResponse } from 'next/server';
import { prisma } from '@repo/shared';
import { convertBigIntToString } from '@/lib/utils';
import { authenticateUser } from '@/lib/auth';
import { AuctionStatus } from '@repo/shared/models';
import { sendNotification } from '@/lib/notification';

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
      auction_history_id,
      companyName,
      address,
      addressDetail,
      zipCode,
      ownerName,
      ownerEmail,
      ownerMobile,
      businessNo,
      bankHolder,
      bankAccount,
      bankCode } = await request.json();

    const user = await prisma.user.findUnique({
      where: {
        id: BigInt(userId as string)
      }
    });

    if (!user) {
      return NextResponse.json({ error: '사용자를 찾을 수 없습니다.' }, { status: 404 });
    }

    const profile = await prisma.profile.findUnique({
      where: {
        id: user.profile_id
      }
    });

    if (!profile) {
      return NextResponse.json({ error: '프로필을 찾을 수 없습니다.' }, { status: 404 });
    }

    const company = await prisma.company.findUnique({
      where: {
        id: profile.company_id
      }
    });

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
    company.secret_info = { bankAccount, bankCode, bankHolder, businessEmail: ownerEmail, businessNo, businessTel: '', businessMobile: ownerMobile }

    const auctionItem = await prisma.auctionItem.findUnique({
      where: {
        id: auctionItemId
      },
      include: {
        medical_device: {
          include: {
            company: true,
            department: true,
            deviceType: true,
            manufacturer: true
          }
        }
      }
    });

    if (!auctionItem) {
      return NextResponse.json({ error: '경매 상품을 찾을 수 없습니다.' }, { status: 404 });
    }

    auctionItem.accept_id = BigInt(auction_history_id);
    auctionItem.status = AuctionStatus.SUCCESS_BID;
    auctionItem.seller_steps = 2;
    auctionItem.buyer_steps = 1;

    const tx = await prisma.$transaction([
      prisma.profile.update({
        where: { id: profile.id },
        data: {
          name: profile.name,
          email: profile.email,
          mobile: profile.mobile
        }
      }),
      prisma.company.update({
        where: { id: company.id },
        data: {
          name: company.name,
          address: company.address,
          address_detail: company.address_detail,
          zipcode: company.zipcode,
          business_no: company.business_no,
          business_mobile: company.business_mobile,
          secret_info: company.secret_info
        }
      }),
      prisma.auctionItem.update({
        where: { id: auctionItem.id },
        data: {
          accept_id: auctionItem.accept_id,
          status: auctionItem.status,
          seller_steps: auctionItem.seller_steps,
          buyer_steps: auctionItem.buyer_steps
        }
      })
    ]);

    // 경매 상품 낙찰 알림발송
    // 경매 상품 낙찰은 낙찰자에게만 발송

    const history = await prisma.auctionItemHistory.findUnique({
      where: {
        id: auction_history_id
      }
    });

    const notificationInfoList = await prisma.notificationInfo.findMany({
      where: {
        user_id: history?.user_id
      }
    });

    if (notificationInfoList.length > 0) {
      await sendNotification({
        type: 'MULTI',
        title: '경매 낙찰',
        body: `경매상품[${auctionItem.medical_device?.deviceType?.name}]이 낙찰 되었습니다.\n[경매번호: ${auctionItem.auction_code}]`,
        userTokens: notificationInfoList.map(info => info.device_token),
        data: {
          type: 'AUCTION',
          screen: 'AuctionDetail',
          targetId: auctionItem.id.toString(),          
          title: '경매 낙찰',
          body: `경매상품[${auctionItem.medical_device?.deviceType?.name}]이 낙찰 되었습니다.\n[경매번호: ${auctionItem.auction_code}]`
        }
      });
    }

    return NextResponse.json(convertBigIntToString(auctionItem));
  } catch (error) {
    console.error('입찰 처리 중 오류:', error);
    return NextResponse.json(
      { error: '입찰 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}