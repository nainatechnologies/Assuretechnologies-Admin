import Loading from '../components/Loading';
import Pagination from '../components/Pagination';
import { useState, useEffect } from 'react';
import API from '../services/api';
import { MdShoppingCart, MdSearch } from 'react-icons/md';
import Swal from 'sweetalert2';
import type { Order, OrderStatus, OrderItem } from '../types';
import OrderTable from '../components/OrderTable';
import OrderModal from '../components/OrderModal';
import TrackOrderModal from '../components/TrackOrderModal';
import SplitOrderModal from '../components/SplitOrderModal';
import { mapApiOrderToOrder } from '../utils/orderMapper';
import './ManageOrders.css';



export default function ManageVendorOrders() {
  const [orders, setOrders] = useState<Order[]>([]);

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      const response = await API.get('/admin/orders');
      const vendorOrdersFetched: any[] = [];
      
      response.data.forEach((o: any) => {
        const vendorItems = (o.items || []).filter((i: any) => i.vendor);
        
        if (vendorItems.length > 0) {
          const itemWithTracking = vendorItems.find((i: any) => i.tracking_id);

          vendorOrdersFetched.push(mapApiOrderToOrder(
            o, 
            vendorItems, 
            parseFloat(o.total_amount) || 0, 
            (i: any) => i.vendor?.business_name || i.vendor?.full_name || 'Vendor Product',
            {
              transportName: itemWithTracking?.transport_name,
              trackingId: itemWithTracking?.tracking_id,
              trackUrl: itemWithTracking?.tracking_url
            }
          ));
        }
      });
      
      setOrders(vendorOrdersFetched);
    } catch (error) {
      console.error('Failed to fetch orders', error);
      Swal.fire('Error', 'Failed to fetch vendor orders', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);
  const [activeTab, setActiveTab] = useState<string>('New');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [trackingOrder, setTrackingOrder] = useState<Order | null>(null);
  const [splittingItem, setSplittingItem] = useState<{ orderId: string; item: OrderItem } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const tabs: string[] = ['New', 'Accepted', 'Out for Delivery', 'Completed', 'Cancelled'];

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

  const vendorOrders = filteredOrders.flatMap(order => {
    const itemsByVendor = order.items.reduce((acc, item) => {
      if (!acc[item.vendorName]) acc[item.vendorName] = [];
      acc[item.vendorName].push(item);
      return acc;
    }, {} as Record<string, OrderItem[]>);

    return Object.entries(itemsByVendor).map(([, vendorItems]) => {
      const vendorTotal = vendorItems.reduce((sum, i) => sum + i.subtotal, 0);
      return {
        ...order,
        items: vendorItems,
        totalAmount: vendorTotal,
      };
    });
  });

  const itemsPerPage = 10;
  const totalPages = Math.ceil(vendorOrders.length / itemsPerPage) || 1;
  const paginatedOrders = vendorOrders.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

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

  const handleSplitOrder = (orderId: string, originalItemId: string, newVendorName: string | null, transferQty: number) => {
    setOrders(orders.map(order => {
      if (order.id !== orderId) return order;

      const newItems = [...order.items];
      const originalItemIndex = newItems.findIndex(i => i.id === originalItemId);
      if (originalItemIndex === -1) return order;

      const originalItem = { ...newItems[originalItemIndex] };
      
      // Reduce original
      originalItem.qty -= transferQty;
      originalItem.subtotal = originalItem.qty * originalItem.price;
      
      if (originalItem.qty === 0) {
        newItems.splice(originalItemIndex, 1);
      } else {
        newItems[originalItemIndex] = originalItem;
      }

      // Create new split item
      const splitItem: OrderItem = {
        ...originalItem,
        id: `${originalItem.id}-split-${Date.now()}`,
        vendorName: newVendorName || 'Unknown Vendor',
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
          
          if (originalItem.qty === 0) {
            newItems.splice(originalItemIndex, 1);
          } else {
            newItems[originalItemIndex] = originalItem;
          }
          
          const splitItem: OrderItem = {
            ...originalItem,
            id: `${originalItem.id}-split-${Date.now()}`,
            vendorName: newVendorName || 'Unknown Vendor',
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

      {isLoading ? (
        <Loading />
      ) : (
        <>
          <OrderTable 
            orders={paginatedOrders} 
            currentTab={activeTab} 
            onViewOrder={setSelectedOrder} 
            onActionOrder={handleActionOrder} 
            onTrackOrder={setTrackingOrder}
            showVendor={true}
            hideActions={true}
          />

          <Pagination 
            currentPage={currentPage} 
            totalPages={totalPages} 
            onPageChange={setCurrentPage} 
          />
        </>
      )}

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

