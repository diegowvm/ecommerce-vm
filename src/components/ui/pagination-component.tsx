import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

interface PaginationComponentProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (itemsPerPage: number) => void;
  loading?: boolean;
  showItemsPerPage?: boolean;
  itemsPerPageOptions?: number[];
}

export function PaginationComponent({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
  loading = false,
  showItemsPerPage = true,
  itemsPerPageOptions = [10, 25, 50, 100]
}: PaginationComponentProps) {
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const getVisiblePageNumbers = () => {
    const delta = 2;
    const pages: (number | string)[] = [];
    
    // Always show first page
    pages.push(1);
    
    if (currentPage - delta > 2) {
      pages.push('...');
    }
    
    // Show pages around current page
    const start = Math.max(2, currentPage - delta);
    const end = Math.min(totalPages - 1, currentPage + delta);
    
    for (let i = start; i <= end; i++) {
      if (!pages.includes(i)) {
        pages.push(i);
      }
    }
    
    if (currentPage + delta < totalPages - 1) {
      pages.push('...');
    }
    
    // Always show last page (if more than 1 page)
    if (totalPages > 1 && !pages.includes(totalPages)) {
      pages.push(totalPages);
    }
    
    return pages;
  };

  if (totalPages <= 1) {
    return (
      <div className="flex items-center justify-between px-2 py-4">
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <span>Total: {totalItems} itens</span>
        </div>
        {showItemsPerPage && (
          <div className="flex items-center space-x-2">
            <span className="text-sm text-muted-foreground">Itens por página:</span>
            <Select
              value={itemsPerPage.toString()}
              onValueChange={(value) => onItemsPerPageChange(Number(value))}
              disabled={loading}
            >
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {itemsPerPageOptions.map((option) => (
                  <SelectItem key={option} value={option.toString()}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 px-2 py-4">
      {/* Info */}
      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
        <span>
          Exibindo {startItem}-{endItem} de {totalItems} itens
        </span>
      </div>

      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-6">
        {/* Items per page */}
        {showItemsPerPage && (
          <div className="flex items-center space-x-2">
            <span className="text-sm text-muted-foreground">Itens por página:</span>
            <Select
              value={itemsPerPage.toString()}
              onValueChange={(value) => onItemsPerPageChange(Number(value))}
              disabled={loading}
            >
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {itemsPerPageOptions.map((option) => (
                  <SelectItem key={option} value={option.toString()}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Pagination controls */}
        <div className="flex items-center space-x-1">
          {/* First page */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(1)}
            disabled={currentPage === 1 || loading}
            className="h-8 w-8 p-0"
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>

          {/* Previous page */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1 || loading}
            className="h-8 w-8 p-0"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          {/* Page numbers */}
          {getVisiblePageNumbers().map((page, index) => (
            <Button
              key={index}
              variant={page === currentPage ? "default" : "outline"}
              size="sm"
              onClick={() => typeof page === 'number' && onPageChange(page)}
              disabled={typeof page === 'string' || loading}
              className="h-8 min-w-8"
            >
              {page}
            </Button>
          ))}

          {/* Next page */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages || loading}
            className="h-8 w-8 p-0"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>

          {/* Last page */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(totalPages)}
            disabled={currentPage === totalPages || loading}
            className="h-8 w-8 p-0"
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}