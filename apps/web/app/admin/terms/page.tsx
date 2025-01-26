export default function TermsManagement() {
  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6">
        <h2 className="text-lg font-semibold mb-4">약관 관리</h2>
        <div className="mb-4">
          <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
            새 약관 추가
          </button>
        </div>
        <table className="w-full">
          <thead>
            <tr>
              <th className="text-left">약관 제목</th>
              <th className="text-left">버전</th>
              <th className="text-left">시행일</th>
              <th className="text-left">상태</th>
              <th className="text-left">작업</th>
            </tr>
          </thead>
          <tbody>
            {/* 약관 목록 데이터 */}
          </tbody>
        </table>
      </div>
    </div>
  );
}