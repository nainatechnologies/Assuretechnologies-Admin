export interface Product {
  id: string;
  name: string;
  category: string;
  price: string;
  banner: string | File;
  bannerName: string;
  description: string;
  status: 'In Stock' | 'Low Stock' | 'Out of Stock';
  additionalImage?: string | File;
  additionalImageName?: string;
  stock?: number;
}

export interface Technician {
  id: string;
  name: string;
  mobile: string;
  email: string;
  address: string;
  location: string;
  status: 'Active' | 'Inactive';
  password?: string;
  idFile?: string | File;
  idFileName?: string;
  nocFile?: string | File;
  nocFileName?: string;
}

export interface Vendor {
  id: string;
  fullName: string;
  businessName: string;
  mobile: string;
  email: string;
  gstNumber: string;
  fullAddress: string;
  pincode: string;
  businessDescription: string;
  bankAccountDetails: string;
  location: string;
  status: 'Active' | 'Inactive';
  password?: string;
  aadharFile?: string | File;
  aadharFileName?: string;
  panFile?: string | File;
  panFileName?: string;
  shopPhotoFile?: string | File;
  shopPhotoFileName?: string;
}

export interface Service {
  id: string;
  category: string;
  subCategory: string;
  image?: string | File;
  imageName?: string;
}

export interface OrderItem {
  id: string;
  productName: string;
  vendorName: string;
  price: number;
  qty: number;
  subtotal: number;
}

export type OrderStatus = 'New' | 'Accepted' | 'Out for Delivery' | 'Completed' | 'Rejected';

export interface Order {
  id: string;
  date: string;
  user: string;
  mobile: string;
  email: string;
  address: string;
  pincode: string;
  totalAmount: number;
  paymentMethod: string;
  paymentStatus: 'Pending' | 'Paid';
  status: OrderStatus;
  items: OrderItem[];
  transportName?: string;
  trackingId?: string;
}

export type ServiceRequestStatus = 
  | 'Pending' 
  | 'Accepted' 
  | 'Assigned' 
  | 'In Progress' 
  | 'Awaiting Approval' 
  | 'Completed' 
  | 'Cancelled';

export type ProgressUpdate = {
  id: string;
  date: string;
  description: string;
  photos: string[];
};

export interface ServiceRequest {
  id: string;
  userId: string;
  userName: string;
  userMobile: string;
  userEmail: string;
  userAddress: string;
  serviceName: string;
  date: string;
  time: string;
  status: ServiceRequestStatus;
  technicianId?: string;
  startDescription?: string;
  startWorkPhotos?: string[];
  completeWorkPhotos?: string[];
  progressUpdates?: ProgressUpdate[];
}

export interface QuotationService {
  id: string;
  name: string;
  qty: number;
  cost: number;
  total: number;
}

export interface Quotation {
  id: string;
  quotationNumber: string;
  customerName: string;
  mobile: string;
  email: string;
  companyName?: string;
  gstNumber?: string;
  address: string;
  pincode: string;
  services: QuotationService[];
  additionalChargesDesc?: string;
  additionalCharges: number;
  gstPercent: number;
  grandTotal: number;
  date: string;
}

export interface InvoiceItem {
  id: string;
  description: string;
  qty: number;
  rate: number;
  amount: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  customerName: string;
  mobile: string;
  email: string;
  address: string;
  items: InvoiceItem[];
  additionalChargesDesc?: string;
  additionalCharges: number;
  gstPercent: number;
  grandTotal: number;
  date: string;
  status?: string;
  srNo?: string;
  serviceName?: string;
}
