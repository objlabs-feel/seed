export default function HelpdeskManagement() {
  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6">
        <h2 className="text-lg font-semibold mb-4">상담센터</h2>
        <div className="mb-4 flex gap-2">
          <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
            새 문의 등록
          </button>
          <button className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600">
            FAQ 관리
          </button>
        </div>
        <table className="w-full">
          <thead>
            <tr>
              <th className="text-left">문의 제목</th>
              <th className="text-left">문의자</th>
              <th className="text-left">문의 유형</th>
              <th className="text-left">접수일</th>
              <th className="text-left">상태</th>
              <th className="text-left">작업</th>
            </tr>
          </thead>
          <tbody>
            {/* 문의 목록 데이터 */}
          </tbody>
        </table>
      </div>
    </div>
  );
}