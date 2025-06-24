'use client';

import React from 'react';
import { Container, Typography, Box, Paper } from '@mui/material';

export default function PrivacyPolicy() {
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={0} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          주식회사 메디딜러 개인정보 처리방침
        </Typography>

        <Box sx={{ my: 4 }}>
          <Typography paragraph>
            주식회사 메디딜러(이하 &ldquo;회사&rdquo;)는 이용자의 개인정보 보호를 매우 중요하게 생각하며, &ldquo;개인정보 보호법&rdquo; 및 관련 법령을 준수하고 있습니다. 이 개인정보 처리방침(이하 &ldquo;방침&rdquo;)은 회사가 운영하는 중고의료기기 경매 플랫폼의 서비스를 이용하는 모든 이용자의 개인정보 수집, 이용, 보관, 처리 및 보호에 관한 사항을 상세히 설명하며, 이용자에게 투명한 정보 제공을 위해 작성되었습니다.
          </Typography>

          <Typography paragraph>
            본 방침은 회사 웹사이트 및 모바일 애플리케이션을 포함한 모든 서비스에 적용됩니다. 본 방침을 통해 회사는 개인정보 처리방침을 명확하게 전달하고, 이용자가 본인의 개인정보 처리에 대해 충분히 이해할 수 있도록 노력합니다. 개인정보 처리방침은 아래와 같은 항목으로 구성됩니다:
          </Typography>

          <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>
            1. 개인정보의 수집 항목 및 수집 방법
          </Typography>
          <Typography paragraph>
            회사는 서비스 제공을 위해 필요한 최소한의 개인정보만을 수집하며, 개인정보의 수집은 법적 근거와 목적에 부합하게 이루어집니다.
          </Typography>

          <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>
            (1) 수집하는 개인정보 항목
          </Typography>
          <Typography variant="subtitle2" sx={{ mt: 1, mb: 1 }}>
            회원 가입 시
          </Typography>
          <Typography component="ul" sx={{ pl: 2 }}>
            <li>필수 항목: 이름, 아이디, 비밀번호, 이메일 주소, 전화번호, 주소</li>
            <li>선택 항목: 생년월일, 성별, 직업, 의료기관명 등</li>
            <li>본인 인증: 주민등록번호 또는 본인 인증 서비스(휴대폰 인증, 아이핀 등)</li>
          </Typography>

          <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
            서비스 이용 과정에서 수집되는 정보
          </Typography>
          <Typography component="ul" sx={{ pl: 2 }}>
            <li>서비스 이용 기록: 접속 로그, 쿠키, IP 주소, 브라우저 정보, 서비스 이용 시간, 방문 기록</li>
            <li>경매 참여 기록: 경매 입찰 내역, 낙찰 내역, 거래 내역</li>
            <li>결제 정보: 결제 수단, 결제 내역, 결제 승인 번호 등</li>
            <li>배송 정보: 배송 주소, 연락처, 배송 요청 사항 등</li>
            <li>기타: 고객지원 요청 내역, 서비스 피드백 등</li>
          </Typography>

          <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
            고객센터 및 지원 관련 정보
          </Typography>
          <Typography component="ul" sx={{ pl: 2 }}>
            <li>고객센터에 문의한 내용, 상담 기록, 이메일 및 전화번호 등</li>
          </Typography>

          <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>
            (2) 개인정보 수집 방법
          </Typography>
          <Typography paragraph>
            회사는 여러 가지 방법으로 개인정보를 수집하며, 그 방법은 다음과 같습니다:
          </Typography>
          <Typography component="ul" sx={{ pl: 2 }}>
            <li>이용자가 직접 제공하는 개인정보:
              <ul>
                <li>회원 가입 시 입력한 정보</li>
                <li>경매 참여 및 결제 시 제공하는 정보</li>
                <li>고객센터 문의 및 서비스 요청 시 제공하는 정보</li>
              </ul>
            </li>
            <li>자동으로 수집되는 개인정보:
              <ul>
                <li>웹사이트나 앱에서 이용자의 방문 기록, 로그 정보, 쿠키, IP 주소 등</li>
                <li>서비스 이용 과정에서 자동으로 수집되는 이용자 행동 및 거래 정보</li>
              </ul>
            </li>
            <li>제3자 서비스를 통해 수집되는 정보:
              <ul>
                <li>결제 대행 서비스, 배송 서비스 제공업체 등을 통한 개인정보 수집</li>
              </ul>
            </li>
          </Typography>

          <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>
            2. 개인정보의 이용 목적
          </Typography>
          <Typography paragraph>
            회사는 수집한 개인정보를 다음과 같은 목적으로 사용합니다:
          </Typography>

          <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>
            (1) 서비스 제공 및 운영
          </Typography>
          <Typography paragraph>
            회사는 이용자에게 보다 나은 서비스를 제공하기 위해 개인정보를 사용합니다. 주요 목적은 다음과 같습니다:
          </Typography>
          <Typography component="ul" sx={{ pl: 2 }}>
            <li>중고의료기기 경매 서비스: 경매에 참여하고 입찰 및 거래를 진행하는 서비스 제공</li>
            <li>맞춤형 서비스 제공: 이용자의 경매 참여 이력 및 선호도를 분석하여 맞춤형 경매 상품 제공</li>
            <li>서비스 알림 및 통지: 경매 시작/종료, 입찰 결과, 배송 정보 등 서비스 관련 알림을 제공</li>
          </Typography>

          <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>
            (2) 서비스 개선 및 품질 향상
          </Typography>
          <Typography paragraph>
            회사는 서비스 품질을 향상시키기 위해 이용자의 정보를 분석하고 개선 작업을 진행합니다:
          </Typography>
          <Typography component="ul" sx={{ pl: 2 }}>
            <li>서비스 개선: 이용자의 피드백과 서비스 이용 패턴을 분석하여 서비스를 개선</li>
            <li>통계 분석: 서비스 이용 현황 및 통계를 분석하여 서비스 전략 수립</li>
            <li>개인화 서비스 제공: 이용자의 관심사와 취향을 분석하여 맞춤형 경매 상품 추천</li>
          </Typography>

          <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>
            (3) 결제 및 거래 처리
          </Typography>
          <Typography paragraph>
            회사는 이용자의 결제 정보와 거래 관련 정보를 사용하여 거래를 원활하게 처리합니다:
          </Typography>
          <Typography component="ul" sx={{ pl: 2 }}>
            <li>결제 처리: 결제 수단 확인 및 결제 승인</li>
            <li>정산 및 환불 처리: 경매 거래 정산, 환불 처리</li>
            <li>법적 의무 이행: 세금 신고 및 거래 내역 보존</li>
          </Typography>

          <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>
            (4) 고객 지원 및 상담
          </Typography>
          <Typography paragraph>
            회사는 고객의 요청과 문의 사항을 신속히 처리하기 위해 개인정보를 이용합니다:
          </Typography>
          <Typography component="ul" sx={{ pl: 2 }}>
            <li>고객 상담: 고객의 문의 사항 처리, 서비스 불만 처리</li>
            <li>상담 기록: 고객의 상담 내용 및 피드백을 기록하여 지속적인 서비스 개선</li>
          </Typography>

          <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>
            (5) 법적 의무 이행
          </Typography>
          <Typography paragraph>
            회사는 관련 법령을 준수하기 위해 필요한 개인정보를 처리합니다:
          </Typography>
          <Typography component="ul" sx={{ pl: 2 }}>
            <li>세금 신고 및 세무 처리: 거래 내역 및 세금 관련 기록 보존</li>
            <li>수사기관의 요청에 의한 개인정보 제공: 수사기관이나 법원의 요청에 따라 개인정보 제공</li>
          </Typography>

          <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>
            (6) 마케팅 및 광고
          </Typography>
          <Typography paragraph>
            회사는 이용자의 동의를 얻어 마케팅 및 광고 목적에 개인정보를 활용할 수 있습니다:
          </Typography>
          <Typography component="ul" sx={{ pl: 2 }}>
            <li>이벤트 및 프로모션: 경품 이벤트, 할인 혜택, 프로모션 안내</li>
            <li>맞춤형 광고 제공: 이용자의 선호도를 기반으로 맞춤형 광고 제공</li>
          </Typography>

          <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>
            3. 개인정보의 보유 및 이용 기간
          </Typography>
          <Typography paragraph>
            회사는 이용자의 개인정보를 서비스 제공에 필요한 기간 동안 보유하며, 법적 의무가 종료되면 즉시 파기합니다. 각 개인정보 항목에 대한 보유 기간은 다음과 같습니다:
          </Typography>

          <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>
            (1) 개인정보 파기 절차 및 방법
          </Typography>
          <Typography paragraph>
            회사는 개인정보 보유 기간이 종료되거나 처리 목적이 달성되면 해당 개인정보를 지체 없이 파기합니다. 파기 절차 및 방법은 다음과 같습니다:
          </Typography>
          <Typography component="ul" sx={{ pl: 2 }}>
            <li>전자적 파일 형태의 개인정보: 기술적 방법을 통해 복구 불가능한 형태로 파기</li>
            <li>종이 문서 형태의 개인정보: 물리적으로 파기</li>
            <li>시스템을 통한 파기: 개인정보 처리 시스템에서 완전 삭제하고 복구 불가능한 형태로 처리</li>
          </Typography>

          <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>
            4. 개인정보의 제3자 제공
          </Typography>
          <Typography paragraph>
            회사는 원칙적으로 이용자의 개인정보를 제3자에게 제공하지 않지만, 다음과 같은 경우에는 개인정보를 제공할 수 있습니다:
          </Typography>

          <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>
            (1) 법적 의무 이행
          </Typography>
          <Typography paragraph>
            법령에 의거하여 수사기관 등의 요청에 의해 개인정보를 제공할 수 있습니다.
          </Typography>
          <Typography component="ul" sx={{ pl: 2 }}>
            <li>법적 의무: 세금 신고, 거래 내역의 법적 기록 보존 등</li>
          </Typography>

          <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>
            (2) 제휴 서비스 제공
          </Typography>
          <Typography component="ul" sx={{ pl: 2 }}>
            <li>결제 대행사: 결제 처리 및 환불을 위한 개인정보 제공</li>
            <li>경매물품 상태확인 및 배송 서비스 제공업체: 경매물품 상태확인 및 상품 배송을 위한 개인정보 제공</li>
            <li>물류 및 보증 관련 제휴업체: 상품의 물류 서비스 및 보증 처리 제공</li>
          </Typography>

          <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>
            5. 개인정보 처리 위탁
          </Typography>
          <Typography paragraph>
            회사는 서비스 제공에 필요한 일부 업무를 외부 업체에 위탁할 수 있습니다. 위탁 받은 업체는 개인정보 보호에 관한 법적 요구 사항을 충족하도록 관리하고 있습니다.
          </Typography>

          <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>
            (1) 위탁 대상 및 위탁 업무
          </Typography>
          <Typography component="ul" sx={{ pl: 2 }}>
            <li>결제 대행사: 결제 처리 및 환불 처리</li>
            <li>배송 서비스 제공업체: 상품 배송 및 반품 처리</li>
            <li>고객 지원 서비스: 고객 문의 및 상담 처리</li>
          </Typography>

          <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>
            6. 이용자의 권리 및 행사 방법
          </Typography>
          <Typography paragraph>
            이용자는 언제든지 본인의 개인정보에 대해 다음과 같은 권리를 행사할 수 있습니다:
          </Typography>

          <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>
            (1) 개인정보 열람
          </Typography>
          <Typography paragraph>
            이용자는 본인이 제공한 개인정보를 열람하고 수정할 수 있습니다.
          </Typography>

          <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>
            (2) 개인정보 정정 및 삭제
          </Typography>
          <Typography paragraph>
            이용자는 부정확한 개인정보를 정정하거나 불필요한 개인정보를 삭제할 수 있습니다.
          </Typography>

          <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>
            (3) 개인정보 처리 정지
          </Typography>
          <Typography paragraph>
            이용자는 개인정보 처리에 대한 동의를 철회하거나 개인정보 처리의 일부 또는 전부에 대해 처리 정지를 요청할 수 있습니다.
          </Typography>
          <Typography paragraph>
            이용자는 고객센터를 통해 위 권리를 행사할 수 있으며, 법적 제한에 따라 일부 요청은 거부될 수 있습니다.
          </Typography>

          <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>
            7. 개인정보 보호를 위한 기술적 및 관리적 보호 조치
          </Typography>
          <Typography paragraph>
            회사는 이용자의 개인정보를 보호하기 위해 최선의 노력을 다하고 있습니다. 개인정보 보호를 위한 주요 조치는 다음과 같습니다:
          </Typography>

          <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>
            (1) 기술적 보호 조치
          </Typography>
          <Typography component="ul" sx={{ pl: 2 }}>
            <li>암호화: 개인정보는 SSL 암호화 기술 등을 사용하여 안전하게 보호합니다.</li>
            <li>방화벽 및 보안 시스템: 외부 공격을 방지하기 위해 방화벽 및 보안 시스템을 운영합니다.</li>
            <li>접속 기록 관리: 개인정보 처리 시스템에 대한 접근 기록을 관리하여 부정 접근을 방지합니다.</li>
          </Typography>

          <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>
            (2) 관리적 보호 조치
          </Typography>
          <Typography component="ul" sx={{ pl: 2 }}>
            <li>정기적인 보안 점검: 개인정보 보호를 위한 보안 점검 및 시스템 점검을 주기적으로 실시합니다.</li>
            <li>직원 교육: 개인정보 보호와 관련된 교육을 통해 직원들의 보안 의식을 강화합니다.</li>
            <li>내부 관리 절차: 개인정보 처리 담당자에 대한 접근 제어 및 관리</li>
          </Typography>

          <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>
            8. 개인정보 보호 책임자 및 연락처
          </Typography>
          <Typography paragraph>
            회사는 개인정보 보호를 담당하는 책임자를 지정하고, 개인정보 보호를 위한 필요한 모든 조치를 취하고 있습니다.
          </Typography>
          <Typography component="ul" sx={{ pl: 2 }}>
            <li>개인정보 보호 책임자: 오은교</li>
            <li>연락처: 031-421-5737 / medidealer@naver.com</li>
            <li>주소: 경기도 안양시 동안구 관평로333,현대아파트상가201호</li>
          </Typography>

          <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>
            9. 개인정보 처리방침 변경
          </Typography>
          <Typography paragraph>
            회사는 개인정보 처리방침을 변경할 수 있으며, 변경 사항은 회사 웹사이트와 모바일 애플리케이션에 공지합니다. 변경된 개인정보 처리방침은 공지일로부터 7일 이내에 적용됩니다.
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
}