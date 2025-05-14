import type { ReactNode } from 'react';

interface Column<T> {
  key: keyof T | string;
  header: string;
  render?: (item: T) => ReactNode;
  onClick?: (item: T) => void;
}

interface TableProps<T> {
  data: T[];
  columns: Column<T>[];
  actions?: (item: T) => ReactNode;
}

function Table<T>({ data, columns, actions }: TableProps<T>) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border border-gray-200">
        <thead>
          <tr className="bg-gray-100">
            {columns.map((column) => (
              <th
                key={column.key.toString()}
                className="px-6 py-3 text-left text-sm font-medium text-gray-700 border-b"
              >
                {column.header}
              </th>
            ))}
            {actions && (
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 border-b">
                Actions
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr key={index} className="hover:bg-gray-50">
              {columns.map((column) => (
                <td key={column.key.toString()} className="px-6 py-4 text-sm text-gray-600 border-b">
                  {column.onClick ? (
                    <button
                      onClick={() => column.onClick!(item)}
                      className="text-blue-600 hover:underline"
                    >
                      {column.render ? column.render(item) : (item[column.key as keyof T] as unknown as ReactNode)}
                    </button>
                  ) : (
                    column.render ? column.render(item) : (item[column.key as keyof T] as unknown as ReactNode)
                  )}
                </td>
              ))}
              {actions && (
                <td className="px-6 py-4 text-sm border-b">
                  {actions(item)}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Table;