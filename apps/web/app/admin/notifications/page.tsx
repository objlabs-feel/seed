export default function NotificationManagement() {
  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6">
        <h2 className="text-lg font-semibold mb-4">알림 관리</h2>
        <div className="mb-4">
          <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
            새 알림 작성
          </button>
        </div>
        <table className="w-full">
          <thead>
            <tr>
              <th className="text-left">알림 제목</th>
              <th className="text-left">발송 대상</th>
              <th className="text-left">발송일</th>
              <th className="text-left">상태</th>
              <th className="text-left">작업</th>
            </tr>
          </thead>
          <tbody>
            {/* 알림 목록 데이터 */}
          </tbody>
        </table>
      </div>
    </div>
  )
} 