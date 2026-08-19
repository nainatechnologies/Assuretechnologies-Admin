import { useState, useEffect } from 'react';
import { MdShoppingCart, MdSearch } from 'react-icons/md';
import API from '../services/api';
import Swal from 'sweetalert2';
import type { Order, OrderStatus, OrderItem } from '../types';
import OrderTable from '../components/OrderTable';
import OrderModal from '../components/OrderModal';
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

  const tabs: string[] = ['New', 'Accepted', 'Out for Delivery', 'Completed'];

  const fetchOrders = async () => {
    try {
      const response = await API.get('/admin/orders');
      const adminOrders: any[] = [];
      
      response.data.forEach((o: any) => {
        const adminItems = (o.items || []).filter((i: any) => !i.vendor);
        
        if (adminItems.length > 0) {
          const adminTotal = adminItems.reduce((sum: number, i: any) => sum + (parseFloat(i.subtotal) || 0), 0);
          
          adminOrders.push({
            id: o.order_number || o.id,
            date: new Date(o.createdAt).toLocaleString(),
            user: o.customer?.full_name || o.customer_name || 'N/A',
            mobile: o.customer?.mobile || o.customer_contact || 'N/A',
            email: o.customer?.email || 'N/A',
            address: o.customer_address || 'N/A',
            totalAmount: adminTotal,
            paymentMethod: 'Online',
            paymentStatus: o.payment_status === 'PAID' ? 'Paid' : 'Pending',
            status: o.status === 'NEW' ? 'New' : o.status === 'ACCEPTED' ? 'Accepted' : o.status === 'OUT_FOR_DELIVERY' ? 'Out for Delivery' : o.status === 'COMPLETED' ? 'Completed' : 'Rejected',
            items: adminItems.map((i: any) => ({
              id: i.id,
              productName: i.product?.name || 'Unknown',
              vendorName: 'Admin Product',
              price: parseFloat(i.price) || 0,
              qty: parseInt(i.qty, 10) || 0,
              subtotal: parseFloat(i.subtotal) || 0
            }))
          });
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

  const handleSplitOrder = async (orderId: string, originalItemId: string, newVendorName: string, transferQty: number) => {
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
