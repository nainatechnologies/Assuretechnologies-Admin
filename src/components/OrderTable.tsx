import { MdRemoveRedEye } from 'react-icons/md';
import type { Order, OrderStatus } from '../types';
import './OrderTable.css';

interface OrderTableProps {
  orders: Order[];
  currentTab: OrderStatus;
  onViewOrder: (order: Order) => void;
  onActionOrder: (orderId: string, action: 'Accept' | 'Reject' | 'Out for Delivery' | 'Complete') => void;
  onTrackOrder?: (order: Order) => void;
}

export default function OrderTable({ orders, currentTab, onViewOrder, onActionOrder, onTrackOrder }: OrderTableProps) {
  if (orders.length === 0) {
    return (
      <div className="order-table-container">
        <table className="order-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Ordered Date</th>
              <th>User</th>
              <th>Contact</th>
              <th>Address</th>
              <th>Amount</th>
              <th>Payment</th>
              <th>View</th>
              {currentTab !== 'New' && <th>Track Id</th>}
              <th>Action</th>
            </tr>
          </thead>
        </table>
        <div className="order-empty-state">
          No orders found
        </div>
      </div>
    );
  }

  return (
    <div className="order-table-container">
      <table className="order-table">
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Ordered Date</th>
            <th>User</th>
            <th>Contact</th>
            <th>Address</th>
            <th>Amount</th>
            <th>Payment</th>
            <th>View</th>
            {currentTab !== 'New' && <th>Track Id</th>}
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id}>
              <td>{order.id}</td>
              <td>{order.date}</td>
              <td>{order.user}</td>
              <td>
                <div className="order-contact-info">
                  <span>{order.mobile}</span>
                  <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>{order.email}</span>
                </div>
              </td>
              <td>
                <div className="order-address-info">
                  <span>{order.address}</span>
                  <span className="order-address-pincode">{order.pincode}</span>
                </div>
              </td>
              <td>₹{order.totalAmount.toFixed(2)}</td>
              <td>
                <div className="order-payment-info">
                  <span>{order.paymentMethod}</span>
                  <span className="payment-status-badge">{order.paymentStatus}</span>
                </div>
              </td>
              <td>
                <button className="order-btn-view" onClick={() => onViewOrder(order)}>
                  <MdRemoveRedEye size={18} />
                </button>
              </td>
              {currentTab !== 'New' && (
                <td>
                  {order.trackingId ? (
                    <div className="order-tracking-info" style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <span className="tracking-id-text" style={{ fontWeight: 'bold', color: '#111827', fontSize: '0.95rem' }}>{order.trackingId}</span>
                      <span className="transport-name-text" style={{ fontSize: '0.75rem', color: '#6b7280' }}>{order.transportName}</span>
                    </div>
                  ) : (
                    <button className="order-btn-track" onClick={() => onTrackOrder?.(order)}>Track</button>
                  )}
                </td>
              )}
              <td>
                <div className="order-action-buttons">
                  {currentTab === 'New' && (
                    <>
                      <button className="order-btn-accept" onClick={() => onActionOrder(order.id, 'Accept')}>Accept</button>
                      <button className="order-btn-reject" onClick={() => onActionOrder(order.id, 'Reject')}>Reject</button>
                    </>
                  )}
                  {currentTab === 'Accepted' && (
                    <button className="order-btn-delivery" onClick={() => onActionOrder(order.id, 'Out for Delivery')}>Out for Delivery</button>
                  )}
                  {currentTab === 'Out for Delivery' && (
                    <button className="order-btn-accept" onClick={() => onActionOrder(order.id, 'Complete')}>Delivered</button>
                  )}
                  {currentTab === 'Completed' && (
                    <span className="order-status-badge">Delivered</span>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
