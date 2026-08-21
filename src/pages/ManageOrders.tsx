import { useState, useEffect } from 'react';
import { MdShoppingCart, MdSearch, MdFilterList, MdFileDownload, MdClose } from 'react-icons/md';
import { API } from '../config';
import Swal from 'sweetalert2';
import type { Order, OrderStatus, OrderItem } from '../types';
import OrderTable from '../components/OrderTable';
import OrderModal from '../components/OrderModal';
import { mapApiOrderToOrder } from '../utils/orderMapper';
import TrackOrderModal from '../components/TrackOrderModal';
import SplitOrderModal from '../components/SplitOrderModal';
import './ManageOrders.css';

export default function ManageOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeTab, setActiveTab] = useState<string>('New');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [trackingOrder, setTrackingOrder] = useState<Order | null>(null);
  const [splittingItem, setSplittingItem] = useState<{ orderId: string; item: OrderItem } | null>(null);

  const tabs: string[] = ['New', 'Accepted', 'Out for Delivery', 'Completed', 'Cancelled'];

  const fetchOrders = async () => {
    try {
      const response = await API.get('/admin/orders');
      const adminOrders: any[] = [];
      
      response.data.forEach((o: any) => {
        // Admin orders only include items assigned to the main platform
        const adminItems = o.items?.filter((i: any) => !i.vendorId) || [];
        if (adminItems.length > 0) {
          const adminTotal = adminItems.reduce((sum: number, i: any) => sum + (parseFloat(i.subtotal) || 0), 0);
          adminOrders.push(mapApiOrderToOrder(o, adminItems, adminTotal, () => 'Admin Product'));
        } else if (!o.isVendorOrder) {
          // All items belong to admin
          const adminTotal = o.items.reduce((sum: number, i: any) => sum + (parseFloat(i.subtotal) || 0), 0);
          adminOrders.push(mapApiOrderToOrder(o, o.items, adminTotal, () => 'Admin Product'));
        }
      });
      
      setOrders(adminOrders);
    } catch (error) {
      console.error('Failed to fetch orders', error);
      Swal.fire('Error', 'Failed to fetch orders', 'error');
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const filteredOrders = orders.filter(order => {
    let matchesTab = order.status === activeTab;
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
      nextStatus = 'Cancelled';
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
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          let payload = {};
          if (action === 'MarkPaid') {
            payload = { payment_status: 'PAID' };
          } else {
            const dbStatus = nextStatus === 'Cancelled' ? 'CANCELLED' :
                             nextStatus === 'Accepted' ? 'ACCEPTED' :
                             nextStatus === 'Out for Delivery' ? 'OUT_FOR_DELIVERY' :
                             nextStatus === 'Completed' ? 'COMPLETED' : 'NEW';
            payload = { status: dbStatus };
          }
          await API.put(`/admin/orders/${orderId}/status`, payload);
          
          if (action === 'MarkPaid') {
            setOrders(orders.map(o => o.id === orderId ? { ...o, paymentStatus: 'Paid' } : o));
          } else {
            setOrders(orders.map(o => o.id === orderId ? { ...o, status: nextStatus } : o));
          }
          Swal.fire('Updated!', successText, 'success');
        } catch (error) {
          console.error('Failed to update order status', error);
          Swal.fire('Error', 'Failed to update order status. Please try again.', 'error');
        }
      }
    });
  };

  const handleSplitOrder = async (orderId: string, originalItemId: string, newVendorName: string | null, transferQty: number) => {
    try {
      // In a real scenario, the modal would return newVendorId instead of name,
      // but to keep the frontend simple for now, we will assume newVendorName is actually the ID or we'd look it up.
      // For this implementation, let's assume SplitOrderModal was updated to send the Vendor ID.
      // Since it's still sending a string name in the mock, we simulate passing it.
      const payload = {
        newVendorId: newVendorName, // Assuming the modal passes the ID here now
        qtyToTransfer: transferQty
      };

      await API.post(`/admin/orders/${orderId}/items/${originalItemId}/split`, payload);
      
      setSplittingItem(null);
      fetchOrders();
      Swal.fire('Split Successful', `Order item split assigned`, 'success');
    } catch (error) {
      console.error('Failed to split order', error);
      Swal.fire('Error', 'Failed to split order', 'error');
    }
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
        hideActions={false} 
        onViewOrder={setSelectedOrder} 
        onActionOrder={handleActionOrder} 
        onTrackOrder={setTrackingOrder}
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
          onSubmit={async (transportName, trackingId, trackUrl) => {
            try {
              await API.put(`/admin/orders/${trackingOrder.id}/tracking`, { transportName, trackingId, trackUrl: trackUrl });
              setOrders(orders.map(o => o.id === trackingOrder.id ? { ...o, transportName, trackingId, trackUrl } : o));
              Swal.fire('Saved!', `Tracking info saved for order ${trackingOrder.id}.`, 'success');
              setTrackingOrder(null);
            } catch (error) {
              console.error('Failed to save tracking', error);
              Swal.fire('Error', 'Failed to save tracking information.', 'error');
            }
          }}
        />
      )}
    </div>
  );
}
