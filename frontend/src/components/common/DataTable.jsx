import React, { useState, useEffect } from "react";

/**
 * A generic, responsive data table with built-in pagination.
 * 
 * @param {Array} headers - Array of objects { label, className }
 * @param {Array} data - The array of items to display
 * @param {Function} renderRow - Function to render each row: (item, index) => <tr ...> or <React.Fragment ...>
 * @param {number} itemsPerPage - Number of items to show per page (default 15)
 * @param {string} emptyMessage - Message to show when data is empty
 * @param {string} className - Additional CSS classes for the table wrapper
 * @param {number} externalPage - Current page controlled from outside (optional)
 * @param {Function} onPageChange - Callback when page changes (optional)
 */
const DataTable = ({
    headers = [],
    data = [],
    renderRow,
    itemsPerPage = 15,
    emptyMessage = "No records found.",
    className = "",
    externalPage,
    onPageChange,
    searchComponent
}) => {
    const [internalPage, setInternalPage] = useState(1);

    // Sync with external page if provided
    const currentPage = externalPage !== undefined ? externalPage : internalPage;

    const totalPages = Math.ceil(data.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentItems = data.slice(startIndex, startIndex + itemsPerPage);

    const handlePageChange = (newPage) => {
        if (onPageChange) {
            onPageChange(newPage);
        } else {
            setInternalPage(newPage);
        }
    };

    // Reset to first page if data changes significantly
    useEffect(() => {
        if (externalPage === undefined) {
            setInternalPage(1);
        }
    }, [data.length]);

    return (
        <div className={`flex flex-col border rounded-xl bg-white overflow-hidden shadow-sm ${className}`}>
            {searchComponent && (
                <div className="p-4 border-b bg-slate-50/50">
                    {searchComponent}
                </div>
            )}
            <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                    <thead>
                        <tr className="bg-slate-50 border-b">
                            {headers.map((h, i) => (
                                <th key={i} className={`p-4 text-left font-bold text-slate-600 uppercase tracking-wider text-[11px] ${h.className || ""}`}>
                                    {h.label}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {currentItems.length > 0 ? (
                            currentItems.map((item, index) => renderRow(item, index))
                        ) : (
                            <tr>
                                <td colSpan={headers.length} className="p-12 text-center text-slate-500 font-medium italic">
                                    {emptyMessage}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {totalPages > 1 && (
                <div className="p-4 bg-slate-50/80 border-t flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="text-xs font-medium text-slate-500">
                        Showing <span className="text-slate-900">{startIndex + 1}</span> to <span className="text-slate-900">{Math.min(startIndex + itemsPerPage, data.length)}</span> of <span className="text-slate-900">{data.length}</span> entries
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                            disabled={currentPage === 1}
                            className="flex items-center justify-center w-8 h-8 rounded-lg border bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white transition-all shadow-sm"
                            title="Previous Page"
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
                        </button>
                        <div className="flex items-center px-1">
                            <span className="text-xs font-bold text-blue-600 w-6 h-6 flex items-center justify-center rounded-md bg-blue-50 border border-blue-100">
                                {currentPage}
                            </span>
                            <span className="text-[10px] text-slate-400 mx-2 font-bold uppercase">of</span>
                            <span className="text-xs font-semibold text-slate-600 min-w-[1.5rem] text-center">
                                {totalPages}
                            </span>
                        </div>
                        <button
                            onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                            disabled={currentPage === totalPages}
                            className="flex items-center justify-center w-8 h-8 rounded-lg border bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white transition-all shadow-sm"
                            title="Next Page"
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

// Helper to handle both functions and fragments mapping
function currentMembersMapped(items, renderRow) {
    return items.map((item, index) => renderRow(item, index));
}

export default DataTable;
