import React from 'react';
import { FiCheckCircle, FiSearch, FiExternalLink } from 'react-icons/fi';
import { BASE_URL } from '../../services/api';
import Pagination from '../../components/Pagination';
import type { PaymentTransaction } from '../../types';

interface TransactionsTabProps {
  transactions: PaymentTransaction[];
  searchQuery: string;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const TransactionsTab: React.FC<TransactionsTabProps> = ({
  transactions,
  searchQuery,
  currentPage,
  totalPages,
  onPageChange
}) => {
  return (
    <div className="table-container">
      <table className="payments-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Type</th>
            <th>Reference / Order ID</th>
            <th>Party</th>
            <th>Method</th>
            <th>Status</th>
            <th>Amount</th>
            <th>Proof</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map(payment => (
            <tr key={payment.id}>
              <td>{payment.date}</td>
              <td>
                <span className={`type-badge ${payment.type}`}>
                  {payment.type === 'incoming' ? '↓ Incoming' : '↑ Outgoing'}
                </span>
              </td>
              <td>
                <strong style={{ color: '#1e293b' }}>{payment.referenceId}</strong>
                {payment.notes && payment.notes !== payment.referenceId && (
                  <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>
                    {payment.notes}
                  </div>
                )}
              </td>
              <td>{payment.party}</td>
              <td>{payment.method}</td>
              <td>
                <span className={`status-badge ${payment.status}`}>
                  {payment.status === 'completed' && <FiCheckCircle style={{ marginRight: '4px' }} />}
                  {payment.status}
                </span>
              </td>
              <td className={`amount-col ${payment.type === 'incoming' ? 'positive' : 'negative'}`}>
                {payment.type === 'incoming' ? '+' : '-'}₹{(payment.amount || 0).toLocaleString()}
              </td>
              <td>
                {payment.proof_image ? (
                  <a 
                    href={payment.proof_image.startsWith('/uploads/') ? `${BASE_URL}${payment.proof_image}` : payment.proof_image} 
                    target="_blank" 
                    rel="noreferrer"
                    style={{ color: '#4f46e5', display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem', textDecoration: 'none' }}
                  >
                    <FiExternalLink /> View
                  </a>
                ) : (
                  <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>—</span>
                )}
              </td>
            </tr>
          ))}
          {transactions.length === 0 && (
            <tr>
              <td colSpan={8}>
                <div className="payments-empty-state">
                  <FiSearch size={32} />
                  <p>No transactions found{searchQuery ? ` for "${searchQuery}"` : ''}.</p>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {totalPages > 1 && (
        <div style={{ marginTop: '20px' }}>
          <Pagination 
            currentPage={currentPage} 
            totalPages={totalPages} 
            onPageChange={onPageChange} 
          />
        </div>
      )}
    </div>
  );
};
