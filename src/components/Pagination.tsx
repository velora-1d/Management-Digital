"use client";
import { useState } from "react";

interface PaginationProps {
  page: number;
  totalPages: number;
  total: number;
  limit?: number;
  onPageChange: (page: number) => void;
  onLimitChange?: (limit: number) => void;
}

const LIMIT_OPTIONS = [10, 20, 50, 100];

export default function Pagination({ page, totalPages, total, limit = 20, onPageChange, onLimitChange }: PaginationProps) {
  const [jumpValue, setJumpValue] = useState("");
  const [showJump, setShowJump] = useState(false);

  if (total === 0) return null;

  const startItem = Math.min((page - 1) * limit + 1, total);
  const endItem = Math.min(page * limit, total);

  // Smart page number generation
  const pages: (number | "...")[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (page > 3) pages.push("...");
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) pages.push(i);
    if (page < totalPages - 2) pages.push("...");
    pages.push(totalPages);
  }

  function handleJump() {
    const p = parseInt(jumpValue);
    if (p >= 1 && p <= totalPages) {
      onPageChange(p);
      setJumpValue("");
      setShowJump(false);
    }
  }

  return (
    <div className="pagination-modern">
      {/* Left: Info & Per Page */}
      <div className="pagination-left">
        <span className="pagination-info">
          <span className="pagination-info-label">Menampilkan</span>
          <span className="pagination-info-range">{startItem}–{endItem}</span>
          <span className="pagination-info-label">dari</span>
          <span className="pagination-info-total">{total.toLocaleString("id-ID")}</span>
        </span>

        {onLimitChange && (
          <div className="pagination-limit-wrap">
            <select
              value={limit}
              onChange={(e) => onLimitChange(Number(e.target.value))}
              className="pagination-limit-select"
            >
              {LIMIT_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>{opt} / hal</option>
              ))}
            </select>
            <svg className="pagination-limit-chevron" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        )}
      </div>

      {/* Right: Navigation */}
      <div className="pagination-right">
        {/* Prev Button */}
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="pagination-nav-btn"
          title="Halaman sebelumnya"
        >
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Page Numbers */}
        <div className="pagination-pages">
          {pages.map((p, i) =>
            p === "..." ? (
              <button
                key={`dots-${i}`}
                className="pagination-dots"
                onClick={() => setShowJump(!showJump)}
                title="Lompat ke halaman"
              >
                •••
              </button>
            ) : (
              <button
                key={p}
                onClick={() => onPageChange(p as number)}
                className={`pagination-page-btn ${p === page ? "active" : ""}`}
              >
                {p}
              </button>
            )
          )}
        </div>

        {/* Next Button */}
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="pagination-nav-btn"
          title="Halaman berikutnya"
        >
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {/* Jump to Page */}
        {showJump && (
          <div className="pagination-jump">
            <input
              type="number"
              min={1}
              max={totalPages}
              value={jumpValue}
              onChange={(e) => setJumpValue(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleJump(); if (e.key === "Escape") setShowJump(false); }}
              placeholder={`1-${totalPages}`}
              className="pagination-jump-input"
              autoFocus
            />
            <button onClick={handleJump} className="pagination-jump-btn">
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
          </div>
        )}
      </div>

      <style jsx>{`
        .pagination-modern {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          justify-content: space-between;
          gap: 0.75rem;
          padding: 0.875rem 1.5rem;
          border-top: 1px solid #f1f5f9;
          background: linear-gradient(180deg, #fafbfd 0%, #f8fafc 100%);
        }

        .pagination-left {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .pagination-info {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          font-size: 0.75rem;
        }

        .pagination-info-label {
          color: #94a3b8;
          font-weight: 500;
        }

        .pagination-info-range {
          font-weight: 700;
          color: #475569;
          background: #e2e8f0;
          padding: 0.125rem 0.5rem;
          border-radius: 0.375rem;
          font-variant-numeric: tabular-nums;
        }

        .pagination-info-total {
          font-weight: 700;
          color: #6366f1;
          font-variant-numeric: tabular-nums;
        }

        .pagination-limit-wrap {
          position: relative;
          display: inline-flex;
          align-items: center;
        }

        .pagination-limit-select {
          appearance: none;
          padding: 0.375rem 1.75rem 0.375rem 0.625rem;
          font-size: 0.6875rem;
          font-weight: 600;
          color: #475569;
          background: #fff;
          border: 1.5px solid #e2e8f0;
          border-radius: 0.5rem;
          cursor: pointer;
          outline: none;
          transition: all 0.2s;
        }

        .pagination-limit-select:hover {
          border-color: #6366f1;
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.08);
        }

        .pagination-limit-select:focus {
          border-color: #6366f1;
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.12);
        }

        .pagination-limit-chevron {
          position: absolute;
          right: 0.375rem;
          width: 0.75rem;
          height: 0.75rem;
          color: #94a3b8;
          pointer-events: none;
        }

        .pagination-right {
          display: flex;
          align-items: center;
          gap: 0.375rem;
        }

        .pagination-nav-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 2rem;
          height: 2rem;
          border-radius: 0.5rem;
          border: 1.5px solid #e2e8f0;
          background: #fff;
          color: #475569;
          cursor: pointer;
          transition: all 0.2s;
        }

        .pagination-nav-btn:hover:not(:disabled) {
          background: #6366f1;
          border-color: #6366f1;
          color: #fff;
          box-shadow: 0 2px 8px rgba(99, 102, 241, 0.25);
          transform: translateY(-1px);
        }

        .pagination-nav-btn:disabled {
          opacity: 0.35;
          cursor: not-allowed;
        }

        .pagination-pages {
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }

        .pagination-page-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 2rem;
          height: 2rem;
          padding: 0 0.375rem;
          font-size: 0.75rem;
          font-weight: 700;
          border-radius: 0.5rem;
          border: 1.5px solid transparent;
          background: transparent;
          color: #64748b;
          cursor: pointer;
          transition: all 0.2s;
          font-variant-numeric: tabular-nums;
        }

        .pagination-page-btn:hover:not(.active) {
          background: #f1f5f9;
          color: #6366f1;
          border-color: #e2e8f0;
        }

        .pagination-page-btn.active {
          background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
          color: #fff;
          border-color: transparent;
          box-shadow: 0 2px 8px rgba(99, 102, 241, 0.3);
          transform: scale(1.05);
        }

        .pagination-dots {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 2rem;
          height: 2rem;
          font-size: 0.625rem;
          letter-spacing: 0.1em;
          color: #94a3b8;
          background: none;
          border: none;
          cursor: pointer;
          border-radius: 0.5rem;
          transition: all 0.2s;
        }

        .pagination-dots:hover {
          background: #eef2ff;
          color: #6366f1;
        }

        .pagination-jump {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          margin-left: 0.25rem;
          animation: fadeIn 0.2s ease;
        }

        .pagination-jump-input {
          width: 3.5rem;
          height: 2rem;
          padding: 0 0.375rem;
          font-size: 0.75rem;
          font-weight: 600;
          text-align: center;
          border: 1.5px solid #c7d2fe;
          border-radius: 0.5rem;
          outline: none;
          background: #fff;
          color: #1e293b;
          transition: all 0.2s;
          -moz-appearance: textfield;
        }

        .pagination-jump-input::-webkit-inner-spin-button,
        .pagination-jump-input::-webkit-outer-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }

        .pagination-jump-input:focus {
          border-color: #6366f1;
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.12);
        }

        .pagination-jump-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 2rem;
          height: 2rem;
          border-radius: 0.5rem;
          border: none;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          color: #fff;
          cursor: pointer;
          transition: all 0.2s;
        }

        .pagination-jump-btn:hover {
          box-shadow: 0 2px 8px rgba(99, 102, 241, 0.3);
          transform: translateY(-1px);
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateX(-8px); }
          to { opacity: 1; transform: translateX(0); }
        }

        @media (max-width: 640px) {
          .pagination-modern {
            padding: 0.75rem 1rem;
            gap: 0.5rem;
          }
          .pagination-info-label {
            display: none;
          }
          .pagination-info-range,
          .pagination-info-total {
            font-size: 0.6875rem;
          }
          .pagination-info::before {
            content: '';
          }
          .pagination-page-btn,
          .pagination-nav-btn {
            min-width: 1.75rem;
            height: 1.75rem;
            font-size: 0.6875rem;
          }
        }
      `}</style>
    </div>
  );
}
