export default function CustomerManagement() {
  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6">
        <h2 className="text-lg font-semibold mb-4">고객 관리</h2>
        <div className="mb-4">
          <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
            고객 등록
          </button>
        </div>
        <table className="w-full">
          <thead>
            <tr>
              <th className="text-left">고객명</th>
              <th className="text-left">연락처</th>
              <th className="text-left">가입일</th>
              <th className="text-left">최근 거래일</th>
              <th className="text-left">등급</th>
              <th className="text-left">작업</th>
            </tr>
          </thead>
          <tbody>
            {/* 고객 목록 데이터 */}
          </tbody>
        </table>
      </div>
    </div>
  );
}