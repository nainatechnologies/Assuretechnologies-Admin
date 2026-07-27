import { MdChevronLeft, MdChevronRight } from 'react-icons/md';
import './Pagination.css';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  const getPaginationItems = () => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    
    if (currentPage <= 3) {
      return [1, 2, 3, 4, '...', totalPages - 1, totalPages];
    }
    
    if (currentPage >= totalPages - 2) {
      return [1, 2, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    }
    
    return [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
  };

  const items = getPaginationItems();

  if (totalPages <= 1) return null;

  return (
    <div className="custom-pagination">
      <button 
        className="page-nav-btn"
        disabled={currentPage === 1}
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
      >
        <MdChevronLeft size={20} />
      </button>

      {items.map((item, index) => {
        if (item === '...') {
          return <span key={`ellipsis-${index}`} className="page-ellipsis">...</span>;
        }
        
        return (
          <button
            key={`page-${item}`}
            className={`page-num-btn ${currentPage === item ? 'active' : ''}`}
            onClick={() => onPageChange(item as number)}
          >
            {item}
          </button>
        );
      })}

      <button 
        className="page-nav-btn"
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
      >
        <MdChevronRight size={20} />
      </button>
    </div>
  );
}
