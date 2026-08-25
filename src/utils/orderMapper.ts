import type { Order } from '../types';

export const mapApiOrderToOrder = (
  o: any, 
  items: any[], 
  totalAmount: number, 
  mapItemVendorName: (i: any) => string,
  extraTransportData?: { transportName?: string; trackingId?: string; trackUrl?: string }
): Order => {
  return {
    id: o.order_number || o.id,
    date: new Date(o.createdAt).toLocaleString(),
    user: o.customer?.full_name || o.customer_name || 'N/A',
    mobile: o.customer?.mobile || o.customer_contact || 'N/A',
    email: o.customer?.email || 'N/A',
    address: o.customer_address || 'N/A',
    companyName: o.company_name || undefined,
    gstNumber: o.gst_number || undefined,
    pincode: o.customer?.pincode || 'N/A',
    totalAmount: totalAmount,
    paymentMethod: 'Online',
    paymentStatus: o.payment_status === 'PAID' ? 'Paid' : 'Pending',
    status: o.status === 'NEW' ? 'New' 
          : o.status === 'ACCEPTED' ? 'Accepted' 
          : o.status === 'OUT_FOR_DELIVERY' ? 'Out for Delivery' 
          : o.status === 'COMPLETED' ? 'Completed' 
          : o.status === 'CANCELLED' ? 'Cancelled' 
          : 'Rejected',
    transportName: extraTransportData !== undefined ? extraTransportData.transportName : (o.transport_name || undefined),
    trackingId: extraTransportData !== undefined ? extraTransportData.trackingId : (o.tracking_id || undefined),
    trackUrl: extraTransportData !== undefined ? extraTransportData.trackUrl : (o.tracking_url || undefined),
    items: items.map((i: any) => ({
      id: i.id,
      productName: i.product?.name || 'Unknown',
      vendorName: mapItemVendorName(i),
      vendorId: i.vendor_id,
      trackingId: i.tracking_id,
      transportName: i.transport_name,
      trackUrl: i.tracking_url,
      price: parseFloat(i.price) || 0,
      qty: parseInt(i.qty, 10) || 0,
      subtotal: parseFloat(i.subtotal) || 0
    }))
  };
};
