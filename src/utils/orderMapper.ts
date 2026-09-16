import type { Order } from '../types';

export const mapApiOrderToOrder = (
  o: any, 
  items: any[], 
  totalAmount: number, 
  mapItemVendorName: (i: any) => string,
  extraTransportData?: { transportName?: string; trackingId?: string; trackUrl?: string }
): Order => {
  const effectiveStatus = (items.length === 1 && items[0]?.status) ? items[0].status : (o.status || items[0]?.status);
  const itemTracking = items.find((i: any) => i.tracking_id);
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
    paymentMethod: o.payment_method ? (o.payment_method === 'UPI' ? 'UPI / QR Code' : o.payment_method === 'CARD' ? 'Credit / Debit Card' : o.payment_method) : 'Online',
    paymentStatus: (o.payment_status === 'PAID' || o.payment_status === 'REFUND_PENDING' || o.payment_status === 'REFUNDED') ? 'Paid' : 'Pending',
    razorpayPaymentId: o.razorpay_payment_id || undefined,
    paymentDetails: o.payment_details || undefined,
    paidAt: o.paid_at ? new Date(o.paid_at).toLocaleString() : ((o.payment_status === 'PAID' || o.payment_status === 'REFUND_PENDING' || o.payment_status === 'REFUNDED') ? new Date(o.updatedAt || o.createdAt).toLocaleString() : undefined),
    status: effectiveStatus === 'NEW' ? 'New' 
          : effectiveStatus === 'ACCEPTED' ? 'Accepted' 
          : effectiveStatus === 'OUT_FOR_DELIVERY' ? 'Out for Delivery' 
          : effectiveStatus === 'COMPLETED' ? 'Completed' 
          : effectiveStatus === 'CANCELLED' ? 'Cancelled' 
          : 'Rejected',
    transportName: extraTransportData !== undefined ? extraTransportData.transportName : (itemTracking?.transport_name || undefined),
    trackingId: extraTransportData !== undefined ? extraTransportData.trackingId : (itemTracking?.tracking_id || undefined),
    trackUrl: extraTransportData !== undefined ? extraTransportData.trackUrl : (itemTracking?.tracking_url || undefined),
    items: items.map((i: any) => ({
      id: i.id,
      productName: i.product?.name || 'Unknown',
      vendorName: mapItemVendorName(i),
      vendorId: i.vendor_id,
      status: i.status,
      trackingId: i.tracking_id,
      transportName: i.transport_name,
      trackUrl: i.tracking_url,
      price: parseFloat(i.price) || 0,
      qty: parseInt(i.qty, 10) || 0,
      subtotal: parseFloat(i.subtotal) || 0
    }))
  };
};
