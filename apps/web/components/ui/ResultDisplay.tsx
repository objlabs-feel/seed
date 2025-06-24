import React from 'react';
import { useRouter } from 'next/navigation';

type ResultType = 'success' | 'error' | 'info';

interface ResultDisplayProps {
  type: ResultType;
  title: string;
  data: string | object | null;
}

const typeStyles = {
  success: {
    titleColor: 'text-green-700 dark:text-green-400',
    bgColor: 'bg-slate-100 dark:bg-slate-800',
    textColor: 'text-slate-800 dark:text-slate-200',
  },
  error: {
    titleColor: 'text-red-700 dark:text-red-400',
    bgColor: 'bg-red-50 dark:bg-red-900/20',
    textColor: 'text-red-800 dark:text-red-300',
  },
  info: {
    titleColor: 'text-indigo-700 dark:text-indigo-400',
    bgColor: 'bg-slate-100 dark:bg-slate-800',
    textColor: 'text-slate-800 dark:text-slate-200',
  },
};

export const ResultDisplay: React.FC<ResultDisplayProps> = ({ type, title, data }) => {
  const router = useRouter();
  if (!data) return null;

  const styles = typeStyles[type];
  
  const handleItemClick = (itemId: string) => {
    router.push(`/test/client/saleitems/${itemId}`);
  };

  const renderData = () => {
    if (typeof data === 'string') return data;
    
    const jsonData = data as any;
    if (jsonData.data?.items) {
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            {jsonData.data.items.map((item: any) => (
              <div
                key={item.id}
                onClick={() => handleItemClick(item.id)}
                className="p-4 bg-white dark:bg-slate-700 rounded-lg shadow cursor-pointer hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-medium">ID: {item.id}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">판매유형: {item.sales_type}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">상태: {item.status}</p>
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {new Date(item.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 text-sm text-gray-600 dark:text-gray-300">
            총 {jsonData.data.total}개 항목 (페이지 {jsonData.data.page}/{Math.ceil(jsonData.data.total / jsonData.data.limit)})
          </div>
        </div>
      );
    }
    
    return <pre className="whitespace-pre-wrap break-words">{JSON.stringify(data, null, 2)}</pre>;
  };

  return (
    <div className="mt-6">
      <h3 className={`text-lg font-semibold mb-2 ${styles.titleColor}`}>{title}</h3>
      <div className={`p-4 ${styles.bgColor} ${styles.textColor} text-sm rounded-md overflow-x-auto`}>
        {renderData()}
      </div>
    </div>
  );
}; 