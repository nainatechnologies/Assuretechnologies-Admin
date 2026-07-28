import { useState } from 'react';
import { MdShoppingCart } from 'react-icons/md';
import Swal from 'sweetalert2';
import type { Order, OrderStatus } from '../types';
import OrderTable from '../components/OrderTable';
import OrderModal from '../components/OrderModal';
import TrackOrderModal from '../components/TrackOrderModal';
import './ManageOrders.css';

// Mock Data
const initialOrders: Order[] = [
  {
    id: 'ORD20260715140901778',
    date: '15 Jul 2026, 08:39 AM',
    user: 'admin',
    mobile: '9988776655',
    email: 'shyam.matham@nainatechnologies.in',
    address: 'hyd',
    pincode: '506134',
    totalAmount: 10000.00,
    paymentMethod: 'COD',
    paymentStatus: 'Pending',
    status: 'New',
    items: [
      { id: '1', productName: 'camera', vendorName: 'Admin Product', price: 10000.00, qty: 1, subtotal: 10000.00 }
    ]
  },
  {
    id: 'ORD20260714170434832',
    date: '14 Jul 2026, 11:34 AM',
    user: 'admin',
    mobile: '9988776655',
    email: 'shyam.matham@nainatechnologies.in',
    address: 'hyd',
    pincode: '506134',
    totalAmount: 5000.00,
    paymentMethod: 'COD',
    paymentStatus: 'Pending',
    status: 'New',
    items: [
      { id: '2', productName: 'lens', vendorName: 'Admin Product', price: 5000.00, qty: 1, subtotal: 5000.00 }
    ]
  },
  {
    id: 'ORD20260714163256924',
    date: '14 Jul 2026, 11:02 AM',
    user: 'admin',
    mobile: '9988776655',
    email: 'shyam.matham@nainatechnologies.in',
    address: 'hyd',
    pincode: '506134',
    totalAmount: 10000.00,
    paymentMethod: 'COD',
    paymentStatus: 'Pending',
    status: 'Completed',
    items: [
      { id: '3', productName: 'camera', vendorName: 'Admin Product', price: 10000.00, qty: 1, subtotal: 10000.00 }
    ]
  }
];

export default function ManageOrders() {
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [activeTab, setActiveTab] = useState<OrderStatus>('New');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [trackingOrder, setTrackingOrder] = useState<Order | null>(null);

  const tabs: OrderStatus[] = ['New', 'Accepted', 'Out for Delivery', 'Completed'];

  const filteredOrders = orders.filter(order => order.status === activeTab);

  const handleActionOrder = (orderId: string, action: 'Accept' | 'Reject' | 'Out for Delivery' | 'Complete') => {
    let actionText = '';
    let successText = '';
    let nextStatus: OrderStatus = 'New';

    if (action === 'Reject') {
      actionText = 'reject this order';
      successText = 'The order has been rejected.';
      nextStatus = 'Rejected';
    } else if (action === 'Accept') {
      actionText = 'accept this order';
      successText = 'Order status updated to Accepted.';
      nextStatus = 'Accepted';
    } else if (action === 'Out for Delivery') {
      actionText = 'mark this order as Out for Delivery';
      successText = 'Order status updated to Out for Delivery.';
      nextStatus = 'Out for Delivery';
    } else if (action === 'Complete') {
      actionText = 'mark this order as Delivered';
      successText = 'Order status updated to Completed.';
      nextStatus = 'Completed';
    }

    Swal.fire({
      title: 'Are you sure?',
      text: `Do you want to ${actionText}?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: action === 'Reject' ? '#ef4444' : '#10b981',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes'
    }).then((result) => {
      if (result.isConfirmed) {
        setOrders(orders.map(o => o.id === orderId ? { ...o, status: nextStatus } : o));
        Swal.fire('Updated!', successText, 'success');
      }
    });
  };

  return (
    <div className="page-content">
      <div className="manage-orders-header">
        <MdShoppingCart size={28} color="#6b7280" />
        <h1>Product Orders</h1>
      </div>

      <div className="orders-tabs-container">
        {tabs.map(tab => (
          <button
            key={tab}
            className={`order-tab ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab === 'New' ? 'New Orders' : tab}
          </button>
        ))}
      </div>

      <OrderTable 
        orders={filteredOrders} 
        currentTab={activeTab} 
        onViewOrder={setSelectedOrder} 
        onActionOrder={handleActionOrder} 
        onTrackOrder={setTrackingOrder}
      />

      {selectedOrder && (
        <OrderModal 
          order={selectedOrder} 
          onClose={() => setSelectedOrder(null)} 
        />
      )}

      {trackingOrder && (
        <TrackOrderModal
          order={trackingOrder}
          onClose={() => setTrackingOrder(null)}
          onSubmit={(transportName, trackingId) => {
            setOrders(orders.map(o => o.id === trackingOrder.id ? { ...o, transportName, trackingId } : o));
            Swal.fire('Saved!', `Tracking info saved for order ${trackingOrder.id}.`, 'success');
            setTrackingOrder(null);
          }}
        />
      )}
    </div>
  );
}
