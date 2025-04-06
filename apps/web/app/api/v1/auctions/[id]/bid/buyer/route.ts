import { NextResponse } from 'next/server';
import { prisma } from '@repo/shared';
import { convertBigIntToString } from '@/lib/utils';
import { authenticateUser } from '@/lib/auth';
import { AuctionStatus, ICompany, IProfile } from '@repo/shared/models';
import { sendNotification } from '@/lib/notification';

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
      seller_steps: 3,
      buyer_steps: 3
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

  const history = await prisma.auctionItemHistory.findUnique({
    where: {
      id: auctionItem.accept_id
    }
  });

  // 방문 일정 교환 알림발송
  const notificationInfoList = await prisma.notificationInfo.findMany({
    where: {
      user_id: {
        in: [auctionItem.medical_device?.company?.owner_id, userId, history?.user_id]
      }
    }
  });

  if (notificationInfoList.length > 0) {
    await sendNotification({
      type: 'MULTI',
      title: '입금확인',
      body: `경매상품[${auctionItem.medical_device?.deviceType?.name}]에 대한 방문일정을 확인하세요.\n[경매번호: ${auctionItem.auction_code}]`,
      userTokens: notificationInfoList.map(info => info.device_token),
      data: {
        type: 'AUCTION',
        screen: 'AuctionDetail',
        targetId: auctionItem.id.toString(),        
        title: '입금확인',
        body: `경매상품[${auctionItem.medical_device?.deviceType?.name}]에 대한 방문일정을 확인하세요.\n[경매번호: ${auctionItem.auction_code}]`
      }
    });
  }

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
    } else {
      company = await prisma.company.findUnique({
        where: {
          id: profile.company_id
        }
      });
    }

    if (!company) {
      return NextResponse.json({ error: '회사를 찾을 수 없습니다.' }, { status: 404 });
    }

    const updatedCompany = {
      id: company.id,
      name: companyName,
      address: address,
      address_detail: addressDetail,
      zipcode: zipCode,
      business_no: businessNo,
      business_mobile: ownerMobile,
      secret_info: {
        bankAccount: '',
        bankCode: '',
        bankHolder: '',
        businessEmail: ownerEmail,
        businessNo,
        businessTel: '',
        businessMobile: ownerMobile
      }
    };

    company.name = companyName;
    company.address = address;
    company.address_detail = addressDetail;
    company.zipcode = zipCode;
    company.business_no = businessNo;
    company.business_mobile = ownerMobile;
    profile.name = ownerName;
    profile.email = ownerEmail;
    profile.mobile = ownerMobile;

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

    auctionItem.seller_steps = 2;
    auctionItem.buyer_steps = 2;

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
          secret_info: updatedCompany.secret_info
        }
      }),
      prisma.auctionItem.update({
        where: { id: auctionItem.id },
        data: {
          seller_steps: auctionItem.seller_steps,
          buyer_steps: auctionItem.buyer_steps
        }
      })
    ]);

    const notificationInfoList = await prisma.notificationInfo.findMany({
      where: {
        user_id: auctionItem.medical_device?.company?.owner_id
      }
    });

    if (notificationInfoList.length > 0) {
      await sendNotification({
        type: 'MULTI',
        title: '입금대기',
        body: `경매상품[${auctionItem.medical_device?.deviceType?.name}]이 입금대기 상태가 되었습니다.\n[경매번호: ${auctionItem.auction_code}]`,
        userTokens: notificationInfoList.map(info => info.device_token),
        data: {
          type: 'AUCTION',
          screen: 'AuctionDetail',
          targetId: auctionItem.id.toString(),          
          title: '입금대기',
          body: `경매상품[${auctionItem.medical_device?.deviceType?.name}]이 입금대기 상태가 되었습니다.\n[경매번호: ${auctionItem.auction_code}]`
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