import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems?: number;
  itemsPerPage?: number;
  className?: string;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  itemsPerPage,
  className = '',
}) => {
  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  const startItem = totalItems && itemsPerPage ? (currentPage - 1) * itemsPerPage + 1 : null;
  const endItem = totalItems && itemsPerPage 
    ? Math.min(currentPage * itemsPerPage, totalItems) 
    : null;

  return (
    <div className={`flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-white ${className}`}>
      <div className="text-sm text-slate-600 font-medium">
        {totalItems !== undefined && startItem !== null && endItem !== null ? (
          <>
            Hiển thị <span className="font-bold text-slate-800">{startItem}</span> -{' '}
            <span className="font-bold text-slate-800">{endItem}</span> trong tổng số{' '}
            <span className="font-bold text-slate-800">{totalItems}</span> mục
          </>
        ) : (
          `Trang ${currentPage} / ${totalPages}`
        )}
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={handlePrevious}
          disabled={currentPage === 1}
          className={`flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-lg transition-all border-0 ${
            currentPage === 1
              ? 'text-slate-400 cursor-not-allowed bg-slate-50'
              : 'text-slate-700 bg-white hover:bg-slate-50 border border-slate-200'
          }`}
        >
          <ChevronLeft size={16} />
          Trước
        </button>

        <div className="flex items-center gap-1">
          {getPageNumbers().map((page, index) => {
            if (page === '...') {
              return (
                <span key={`ellipsis-${index}`} className="px-2 text-slate-400">
                  ...
                </span>
              );
            }

            const pageNum = page as number;
            const isActive = pageNum === currentPage;

            return (
              <button
                key={pageNum}
                onClick={() => onPageChange(pageNum)}
                className={`min-w-[36px] h-9 px-3 text-sm font-bold rounded-lg transition-all border-0 ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-700 bg-white hover:bg-slate-50 border border-slate-200'
                }`}
              >
                {pageNum}
              </button>
            );
          })}
        </div>

        <button
          onClick={handleNext}
          disabled={currentPage === totalPages}
          className={`flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-lg transition-all border-0 ${
            currentPage === totalPages
              ? 'text-slate-400 cursor-not-allowed bg-slate-50'
              : 'text-slate-700 bg-white hover:bg-slate-50 border border-slate-200'
          }`}
        >
          Sau
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
