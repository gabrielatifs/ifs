import React from 'react';
import { Button } from '@ifs/shared/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function DataTablePagination({ page, setPage, hasNextPage, hasPreviousPage }) {
  return (
    <div className="flex items-center justify-between space-x-4 p-4 border-t border-slate-200/60">
      <div className="text-sm font-medium text-slate-600">
        Page {page}
      </div>
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPage(page - 1)}
          disabled={!hasPreviousPage}
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPage(page + 1)}
          disabled={!hasNextPage}
        >
          Next
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    </div>
  );
}