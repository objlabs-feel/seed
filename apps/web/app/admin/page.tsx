'use client';

import { useState, useEffect } from 'react';

// 집계 기간 타입
type PeriodType = '1d' | '7d' | '30d';

// 임시 데이터 타입 정의
interface DashboardData {
  auctionCount: number;
  profitSummary: {
    daily: number;
    weekly: number;
    monthly: number;
  };
  auctionTrends: {
    registered: { date: string; count: number }[];
    bidded: { date: string; count: number }[];
    completed: { date: string; count: number }[];
  };
  userTrends: {
    newUsers: { date: string; count: number }[];
    auctionUsers: { date: string; count: number }[];
    bidUsers: { date: string; count: number }[];
  };
}

// 임시 데이터
const mockData: DashboardData = {
  auctionCount: 1247,
  profitSummary: {
    daily: 1250000,
    weekly: 8750000,
    monthly: 37500000,
  },
  auctionTrends: {
    registered: [
      { date: '2024-01-01', count: 15 },
      { date: '2024-01-02', count: 22 },
      { date: '2024-01-03', count: 18 },
      { date: '2024-01-04', count: 25 },
      { date: '2024-01-05', count: 30 },
      { date: '2024-01-06', count: 28 },
      { date: '2024-01-07', count: 35 },
    ],
    bidded: [
      { date: '2024-01-01', count: 8 },
      { date: '2024-01-02', count: 12 },
      { date: '2024-01-03', count: 10 },
      { date: '2024-01-04', count: 15 },
      { date: '2024-01-05', count: 18 },
      { date: '2024-01-06', count: 16 },
      { date: '2024-01-07', count: 22 },
    ],
    completed: [
      { date: '2024-01-01', count: 5 },
      { date: '2024-01-02', count: 7 },
      { date: '2024-01-03', count: 6 },
      { date: '2024-01-04', count: 9 },
      { date: '2024-01-05', count: 11 },
      { date: '2024-01-06', count: 10 },
      { date: '2024-01-07', count: 13 },
    ],
  },
  userTrends: {
    newUsers: [
      { date: '2024-01-01', count: 12 },
      { date: '2024-01-02', count: 18 },
      { date: '2024-01-03', count: 15 },
      { date: '2024-01-04', count: 22 },
      { date: '2024-01-05', count: 25 },
      { date: '2024-01-06', count: 20 },
      { date: '2024-01-07', count: 28 },
    ],
    auctionUsers: [
      { date: '2024-01-01', count: 8 },
      { date: '2024-01-02', count: 12 },
      { date: '2024-01-03', count: 10 },
      { date: '2024-01-04', count: 15 },
      { date: '2024-01-05', count: 18 },
      { date: '2024-01-06', count: 16 },
      { date: '2024-01-07', count: 22 },
    ],
    bidUsers: [
      { date: '2024-01-01', count: 15 },
      { date: '2024-01-02', count: 20 },
      { date: '2024-01-03', count: 18 },
      { date: '2024-01-04', count: 25 },
      { date: '2024-01-05', count: 28 },
      { date: '2024-01-06', count: 24 },
      { date: '2024-01-07', count: 32 },
    ],
  },
};

// 숫자 포맷팅 함수
const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('ko-KR').format(num);
};

// 통합 꺾은선 그래프 컴포넌트 (3개 지표)
const MultiLineChart = ({ 
  data1, 
  data2, 
  data3, 
  title, 
  label1, 
  label2, 
  label3,
  color1 = 'blue',
  color2 = 'green',
  color3 = 'purple'
}: { 
  data1: { date: string; count: number }[]; 
  data2: { date: string; count: number }[]; 
  data3: { date: string; count: number }[]; 
  title: string; 
  label1: string;
  label2: string;
  label3: string;
  color1?: string;
  color2?: string;
  color3?: string;
}) => {
  // 데이터 유효성 검사
  if (!data1 || data1.length === 0) {
    return (
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-sm font-medium text-gray-700 mb-3">{title}</h3>
        <div className="flex items-center justify-center h-32 text-gray-500">
          데이터가 없습니다.
        </div>
      </div>
    );
  }

  const maxValue = Math.max(
    ...data1.map(d => d.count || 0),
    ...data2.map(d => d.count || 0),
    ...data3.map(d => d.count || 0),
    1
  );

  // 색상 매핑
  const colorMap: { [key: string]: string } = {
    'blue': '#3b82f6',
    'green': '#10b981',
    'purple': '#8b5cf6',
    'indigo': '#6366f1',
    'orange': '#f59e0b',
    'teal': '#14b8a6'
  };

  const svgColor1 = colorMap[color1] || color1;
  const svgColor2 = colorMap[color2] || color2;
  const svgColor3 = colorMap[color3] || color3;

  // SVG 경로 생성 함수
  const createPath = (data: { date: string; count: number }[]) => {
    if (data.length === 0) return '';
    
    const points = data.map((item, index) => {
      const x = (index / (data.length - 1)) * 100;
      const y = 100 - ((item.count || 0) / maxValue) * 100;
      return `${x},${y}`;
    });
    
    return `M ${points.join(' L ')}`;
  };

  // 점 생성 함수
  const createPoints = (data: { date: string; count: number }[]) => {
    return data.map((item, index) => {
      const x = (index / (data.length - 1)) * 100;
      const y = 100 - ((item.count || 0) / maxValue) * 100;
      return { x, y, value: item.count, date: item.date };
    });
  };

  const path1 = createPath(data1);
  const path2 = createPath(data2);
  const path3 = createPath(data3);
  
  const points1 = createPoints(data1);
  const points2 = createPoints(data2);
  const points3 = createPoints(data3);

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h3 className="text-sm font-medium text-gray-700 mb-3">{title}</h3>
      <div className="relative h-64">
        {/* Y축 라벨 */}
        <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-xs text-gray-500 pr-2 w-12">
          {[100, 75, 50, 25, 0].map((percent) => {
            const value = Math.round((percent / 100) * maxValue);
            return (
              <span key={percent} className="text-right">
                {formatNumber(value)}
              </span>
            );
          })}
        </div>
        
        {/* 그래프 영역 */}
        <div className="ml-12">
          <svg className="w-full h-full" viewBox="0 0 115 100" preserveAspectRatio="none">
            {/* 그리드 라인 */}
            <defs>
              <pattern id="grid" width="16.67" height="25" patternUnits="userSpaceOnUse">
                <path d="M 16.67 0 L 0 0 0 25" fill="none" stroke="#f3f4f6" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100" height="100" fill="url(#grid)" />
            
            {/* 꺾은선 */}
            <path d={path1} fill="none" stroke={svgColor1} strokeWidth="1" />
            <path d={path2} fill="none" stroke={svgColor2} strokeWidth="1" />
            <path d={path3} fill="none" stroke={svgColor3} strokeWidth="1" />
            
            {/* 점들 */}
            {points1.map((point, index) => (
              <circle
                key={`point1-${index}`}
                cx={point.x}
                cy={point.y}
                r="1.5"
                fill={svgColor1}
                className="hover:r-2 transition-all cursor-pointer"
              >
                <title>{`${label1}: ${point.value} (${point.date})`}</title>
              </circle>
            ))}
            {points2.map((point, index) => (
              <circle
                key={`point2-${index}`}
                cx={point.x}
                cy={point.y}
                r="1.5"
                fill={svgColor2}
                className="hover:r-2 transition-all cursor-pointer"
              >
                <title>{`${label2}: ${point.value} (${point.date})`}</title>
              </circle>
            ))}
            {points3.map((point, index) => (
              <circle
                key={`point3-${index}`}
                cx={point.x}
                cy={point.y}
                r="1.5"
                fill={svgColor3}
                className="hover:r-2 transition-all cursor-pointer"
              >
                <title>{`${label3}: ${point.value} (${point.date})`}</title>
              </circle>
            ))}
            
            {/* X축 라벨 */}
            {data1.map((item, index) => {
              const dateParts = item.date.split('-');
              const shortDate = dateParts.length >= 3 ? `${dateParts[1]}/${dateParts[2]}` : item.date;
              const x = (index / (data1.length - 1)) * 100 + 6;
              
              return (
                <text
                  key={`xlabel-${index}`}
                  x={x}
                  y="95"
                  fontSize="4"
                  fill="#6b7280"
                  textAnchor="middle"
                  dominantBaseline="hanging"
                >
                  {shortDate}
                </text>
              );
            })}
          </svg>
        </div>
      </div>
      
      {/* 범례 - 더 많은 여백 추가 */}
      {/* <div className="flex flex-wrap justify-center gap-4 mt-6">
        <div className="flex items-center">
          <div className={`w-3 h-3 bg-${color1}-500 rounded mr-2`}></div>
          <span className="text-xs text-gray-600 whitespace-nowrap">{label1}</span>
        </div>
        <div className="flex items-center">
          <div className={`w-3 h-3 bg-${color2}-500 rounded mr-2`}></div>
          <span className="text-xs text-gray-600 whitespace-nowrap">{label2}</span>
        </div>
        <div className="flex items-center">
          <div className={`w-3 h-3 bg-${color3}-500 rounded mr-2`}></div>
          <span className="text-xs text-gray-600 whitespace-nowrap">{label3}</span>
        </div>
      </div> */}
      
      {/* 범례 */}
      <div className="flex flex-wrap justify-center gap-4 mt-10">
        <div className="flex items-center">
          <div className={`w-3 h-3 bg-${color1}-500 rounded mr-2`}></div>
          <span className="text-xs text-gray-600 whitespace-nowrap">{label1}</span>
        </div>
        <div className="flex items-center">
          <div className={`w-3 h-3 bg-${color2}-500 rounded mr-2`}></div>
          <span className="text-xs text-gray-600 whitespace-nowrap">{label2}</span>
        </div>
        <div className="flex items-center">
          <div className={`w-3 h-3 bg-${color3}-500 rounded mr-2`}></div>
          <span className="text-xs text-gray-600 whitespace-nowrap">{label3}</span>
        </div>
      </div>
    </div>
  );
};

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData>(mockData);
  const [loading, setLoading] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodType>('7d');

  // 실제 API 호출 함수 (현재는 mock 데이터 사용)
  const fetchDashboardData = async (period: PeriodType) => {
    setLoading(true);
    try {
      // TODO: 실제 API 호출로 교체
      // const response = await fetch(`/admin/api/v1/dashboard/summary?period=${period}`);
      // const dashboardData = await response.json();
      // setData(dashboardData);
      
      // 임시로 mock 데이터 사용
      setTimeout(() => {
        setData(mockData);
        setLoading(false);
      }, 500);
    } catch (error) {
      console.error('대시보드 데이터 로딩 실패:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData(selectedPeriod);
  }, [selectedPeriod]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">관리자 대시보드</h1>
        
        {/* 집계 기간 선택 */}
        <div className="flex space-x-2">
          <button
            onClick={() => setSelectedPeriod('1d')}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              selectedPeriod === '1d' 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            전일통계
          </button>
          <button
            onClick={() => setSelectedPeriod('7d')}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              selectedPeriod === '7d' 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            주간통계
          </button>
          <button
            onClick={() => setSelectedPeriod('30d')}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              selectedPeriod === '30d' 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            월간통계
          </button>
        </div>
      </div>
      
      {/* 주요 통계 카드 */}
      <div className="grid gap-6 mb-8 md:grid-cols-2 lg:grid-cols-2">
        {/* 총 경매상품 갯수 */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">총 경매상품</p>
              <p className="text-2xl font-bold text-gray-900">{formatNumber(data.auctionCount)}개</p>
            </div>
          </div>
        </div>

        {/* 선택된 기간 누적 이익 */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                {selectedPeriod === '1d' ? '1일' : selectedPeriod === '7d' ? '7일' : '30일'} 누적 이익
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {formatNumber(
                  selectedPeriod === '1d' ? data.profitSummary.daily :
                  selectedPeriod === '7d' ? data.profitSummary.weekly :
                  data.profitSummary.monthly
                )}원
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 거래완료 상품 기준 누적 이익 상세 */}
      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">거래완료 상품 기준 누적 이익</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-gray-600">순이익 (8%)</p>
            <p className="text-lg font-bold text-blue-600">{formatNumber(data.profitSummary.daily * 0.08)}원</p>
          </div>
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <p className="text-sm text-gray-600">세금 (10%)</p>
            <p className="text-lg font-bold text-red-600">{formatNumber(data.profitSummary.daily * 0.10)}원</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <p className="text-sm text-gray-600">지급대금 (82%)</p>
            <p className="text-lg font-bold text-green-600">{formatNumber(data.profitSummary.daily * 0.82)}원</p>
          </div>
        </div>
      </div>

      {/* 경매상품 등록 증가 추이 */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">경매상품 등록 증가 추이</h2>
        <div className="grid gap-4 md:grid-cols-1">
          <MultiLineChart 
            data1={data.auctionTrends.registered} 
            data2={data.auctionTrends.bidded} 
            data3={data.auctionTrends.completed} 
            title="경매상품 통계" 
            label1="등록 수"
            label2="낙찰 수"
            label3="거래완료 수"
            color1="blue"
            color2="green"
            color3="purple"
          />
        </div>
      </div>

      {/* 사용자 증가 추이 */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">사용자 증가 추이</h2>
        <div className="grid gap-4 md:grid-cols-1">
          <MultiLineChart 
            data1={data.userTrends.newUsers} 
            data2={data.userTrends.auctionUsers} 
            data3={data.userTrends.bidUsers} 
            title="사용자 통계" 
            label1="신규 등록"
            label2="경매 등록"
            label3="입찰 참여"
            color1="indigo"
            color2="orange"
            color3="teal"
          />
        </div>
      </div>
    </div>
  );
}
