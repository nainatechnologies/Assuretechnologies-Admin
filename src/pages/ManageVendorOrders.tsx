import { useState } from 'react';
import { MdShoppingCart, MdSearch } from 'react-icons/md';
import Swal from 'sweetalert2';
import type { Order, OrderStatus, OrderItem } from '../types';
import OrderTable from '../components/OrderTable';
import OrderModal from '../components/OrderModal';
import TrackOrderModal from '../components/TrackOrderModal';
import SplitOrderModal from '../components/SplitOrderModal';
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
      { id: '1', productName: 'camera', vendorName: 'Admin Product', price: 10000.00, qty: 100, subtotal: 1000000.00 }
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
      { id: '2', productName: 'lens', vendorName: 'Assure Vendor', price: 5000.00, qty: 1, subtotal: 5000.00 }
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
      { id: '3', productName: 'camera', vendorName: 'Admin', price: 10000.00, qty: 1, subtotal: 10000.00 }
    ]
  }
];

export default function ManageVendorOrders() {
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [activeTab, setActiveTab] = useState<string>('New');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [trackingOrder, setTrackingOrder] = useState<Order | null>(null);
  const [splittingItem, setSplittingItem] = useState<{ orderId: string; item: OrderItem } | null>(null);

  const tabs: string[] = ['New', 'Accepted', 'Out for Delivery', 'Completed', 'Pending COD'];

  const filteredOrders = orders.filter(order => {
    let matchesTab = false;
    if (activeTab === 'Pending COD') {
      matchesTab = order.status === 'Completed' && order.paymentMethod === 'COD' && order.paymentStatus === 'Pending';
    } else {
      matchesTab = order.status === activeTab;
    }
    const query = searchQuery.toLowerCase();
    const matchesSearch = query === '' || 
      order.id.toLowerCase().includes(query) ||
      order.user.toLowerCase().includes(query) ||
      order.mobile.includes(query) ||
      order.email.toLowerCase().includes(query);
    return matchesTab && matchesSearch;
  });

  const handleActionOrder = (orderId: string, action: 'Accept' | 'Reject' | 'Out for Delivery' | 'Complete' | 'MarkPaid') => {
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
    } else if (action === 'MarkPaid') {
      actionText = 'collect cash and mark this order as Paid';
      successText = 'Payment status updated to Paid.';
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
        if (action === 'MarkPaid') {
          setOrders(orders.map(o => o.id === orderId ? { ...o, paymentStatus: 'Paid' } : o));
        } else {
          setOrders(orders.map(o => o.id === orderId ? { ...o, status: nextStatus } : o));
        }
        Swal.fire('Updated!', successText, 'success');
      }
    });
  };

  const handleSplitOrder = (orderId: string, originalItemId: string, newVendorName: string, transferQty: number) => {
    setOrders(orders.map(order => {
      if (order.id !== orderId) return order;

      const newItems = [...order.items];
      const originalItemIndex = newItems.findIndex(i => i.id === originalItemId);
      if (originalItemIndex === -1) return order;

      const originalItem = { ...newItems[originalItemIndex] };
      
      // Reduce original
      originalItem.qty -= transferQty;
      originalItem.subtotal = originalItem.qty * originalItem.price;
      newItems[originalItemIndex] = originalItem;

      // Create new split item
      const splitItem: OrderItem = {
        ...originalItem,
        id: `${originalItem.id}-split-${Date.now()}`,
        vendorName: newVendorName,
        qty: transferQty,
        subtotal: transferQty * originalItem.price
      };

      newItems.push(splitItem);

      return {
        ...order,
        items: newItems
      };
    }));

    // If we're viewing this order, update it in the view
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder(prev => {
        if (!prev) return prev;
        
        const newItems = [...prev.items];
        const originalItemIndex = newItems.findIndex(i => i.id === originalItemId);
        if (originalItemIndex !== -1) {
          const originalItem = { ...newItems[originalItemIndex] };
          originalItem.qty -= transferQty;
          originalItem.subtotal = originalItem.qty * originalItem.price;
          newItems[originalItemIndex] = originalItem;
          
          const splitItem: OrderItem = {
            ...originalItem,
            id: `${originalItem.id}-split-${Date.now()}`,
            vendorName: newVendorName,
            qty: transferQty,
            subtotal: transferQty * originalItem.price
          };
          newItems.push(splitItem);
        }
        return { ...prev, items: newItems };
      });
    }

    setSplittingItem(null);
    Swal.fire('Split Successful', `Order item split to ${newVendorName}`, 'success');
  };

  return (
    <div className="page-content">
      <div className="manage-orders-header">
        <MdShoppingCart size={28} color="#6b7280" />
        <h1>Product Orders</h1>
      </div>

      <div className="orders-toolbar">
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
        <div className="orders-search-container">
          <MdSearch className="orders-search-icon" size={20} />
          <input 
            type="text" 
            className="orders-search-input" 
            placeholder="Search by ID, name, email or phone..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <OrderTable 
        orders={filteredOrders} 
        currentTab={activeTab} 
        onViewOrder={setSelectedOrder} 
        onActionOrder={handleActionOrder} 
        onTrackOrder={setTrackingOrder}
        showVendor={true}
        hideActions={activeTab !== 'Pending COD'}
      />

      {selectedOrder && (
        <OrderModal 
          order={selectedOrder} 
          onClose={() => setSelectedOrder(null)} 
          onSplitClick={(item) => setSplittingItem({ orderId: selectedOrder.id, item })}
        />
      )}

      {splittingItem && (
        <SplitOrderModal
          orderId={splittingItem.orderId}
          item={splittingItem.item}
          onClose={() => setSplittingItem(null)}
          onSplit={handleSplitOrder}
        />
      )}

      {trackingOrder && (
        <TrackOrderModal
          order={trackingOrder}
          onClose={() => setTrackingOrder(null)}
          onSubmit={(transportName, trackingId, trackUrl) => {
            setOrders(orders.map(o => o.id === trackingOrder.id ? { ...o, transportName, trackingId, trackUrl } : o));
            Swal.fire('Saved!', `Tracking info saved for order ${trackingOrder.id}.`, 'success');
            setTrackingOrder(null);
          }}
        />
      )}
    </div>
  );
}
