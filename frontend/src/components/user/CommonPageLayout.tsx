import React from 'react';
import CommonPageHeader from './CommonPageHeader';
import CommonDataTable from './CommonDataTable';
import RemittancePaging from './RemittancePaging';

interface Column {
  key: string;
  label: string;
  width?: string;
  align?: 'left' | 'center' | 'right';
  render?: (item: any) => React.ReactNode;
}

interface CommonPageLayoutProps {
  title: string;
  subtitle: string;
  gradientColors?: {
    from: string;
    to: string;
  };
  columns: Column[];
  data: any[];
  emptyMessage: string;
  totalCount: number;
  currentPage: number;
  pageSize: number;
  onRowClick?: (item: any) => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  isLoading?: boolean;
  children?: React.ReactNode;
}

const CommonPageLayout: React.FC<CommonPageLayoutProps> = ({
  title,
  subtitle,
  gradientColors,
  columns,
  data,
  emptyMessage,
  totalCount,
  currentPage,
  pageSize,
  onRowClick,
  onPageChange,
  onPageSizeChange,
  isLoading = false,
  children
}) => {
  return (
    <div style={{
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '20px',
      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)'
    }}>
      <CommonPageHeader
        title={title}
        subtitle={subtitle}
        gradientColors={gradientColors}
      />

      {children}

      <CommonDataTable
        columns={columns}
        data={data}
        emptyMessage={emptyMessage}
        onRowClick={onRowClick}
        isLoading={isLoading}
      />

      <RemittancePaging
        currentPage={currentPage}
        totalPages={Math.ceil(totalCount / pageSize)}
        totalItems={totalCount}
        pageSize={pageSize}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
      />
    </div>
  );
};

export default CommonPageLayout;
