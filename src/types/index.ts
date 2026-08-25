export interface Product {
  id: string;
  vendor_id?: string;
  name: string;
  category: string;
  price: string;
  discount?: string | number;
  admin_commission?: string | number;
  banner: string | File;
  bannerName: string;
  description: string;
  status: 'In Stock' | 'Low Stock' | 'Out of Stock' | 'Draft' | 'Active' | 'Inactive';
  stock?: number;
}

export interface Technician {
  id: string;
  display_id?: string;
  name: string;
  mobile: string;
  email: string;
  address: string;
  location: string;
  status: 'Active' | 'Inactive';
  password?: string;
  services?: string[];
  idFile?: string | File;
  idFileName?: string;
  nocFile?: string | File;
  nocFileName?: string;
}

export interface DronePartner {
  id: string;
  display_id?: string;
  name: string;
  mobile: string;
  email: string;
  location: string;
  status: 'Active' | 'Inactive';
  password?: string;
  partnerType?: string;
  coverageAreas?: string;
  equipmentTypes?: string[];
}

export interface Vendor {
  id: string;
  display_id?: string;
  fullName: string;
  mobile: string;
  email: string;
  status: 'Active' | 'Inactive';
  password?: string;
  businessName?: string;
  gstNumber?: string;
  fullAddress?: string;
  pincode?: string;
  businessDescription?: string;
  bankAccountDetails?: string;
  aadharFile?: string | File;
  aadharFileName?: string;
  panFile?: string | File;
  panFileName?: string;
  shopPhotoFile?: string | File;
  shopPhotoFileName?: string;
}

export interface CustomField {
  id: string;
  label: string;
  type: 'text' | 'number' | 'dropdown';
  options?: string[]; // Used when type is 'dropdown'
  required: boolean;
}

export interface Service {
  id: string;
  category: string;
  subCategory: string;
  image?: string | File;
  imageName?: string;
  customFields?: CustomField[];
  prebookingCharge?: number;
  status?: 'Active' | 'Inactive';
}

export interface OrderItem {
  id: string;
  productName: string;
  vendorName: string;
  price: number;
  qty: number;
  subtotal: number;
}

export type OrderStatus = 'New' | 'Accepted' | 'Out for Delivery' | 'Completed' | 'Rejected' | 'Cancelled';

export interface Order {
  id: string;
  date: string;
  user: string;
  mobile: string;
  email: string;
  companyName?: string;
  gstNumber?: string;
  address: string;
  pincode: string;
  totalAmount: number;
  adminCommission?: number;
  paymentMethod: string;
  paymentStatus: 'Pending' | 'Paid';
  status: OrderStatus;
  items: OrderItem[];
  transportName?: string;
  trackingId?: string;
  trackUrl?: string;
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
  customFieldResponses?: Record<string, string>;
  paymentStatus?: 'Prebooking Paid' | 'Pending';
  prebookingAmountPaid?: number;
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
  warranty?: string;
  modelNumber?: string;
  hsnCode?: string;
  serialNumbers?: string[];
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
  vendorBusinessName?: string;
  orderId?: string;
}

export interface PartnerCustomField {
  id: string;
  label: string;
  type: 'text' | 'number' | 'dropdown' | 'file';
  options?: string[]; // for dropdown
  required: boolean;
}

export interface PartnerType {
  id: string;
  name: string; // e.g. "Drone", "Tractor"
  customFields: PartnerCustomField[];
}

export interface PricingType {
  id: string;
  name: string; // e.g. "Per Acre", "Per Hour", "Per Liter"
  label: string; // e.g. "Number of Acres", "Number of Hours"
}

export interface PartnerService {
  id: string;
  category: string;
  serviceName: string;
  pricingTypeId: string; // reference to PricingType
  rate: number;
  image?: string | File;
  imageName?: string;
  customFields?: CustomField[]; // fields required during booking this service
  status?: 'Active' | 'Inactive';
}

export interface Partner {
  id: string;
  display_id?: string;
  name: string;
  mobile: string;
  email: string;
  location: string; // Pincodes
  status: 'Active' | 'Inactive';
  password?: string;
  partnerTypeId: string; // reference to PartnerType
  customFieldValues: Record<string, any>; // key: custom field id, value: response
  services: string[]; // array of PartnerService IDs they provide
}

export type PartnerBookingStatus =
  | 'Pending'
  | 'Accepted'
  | 'Assigned'
  | 'In Progress'
  | 'Awaiting Approval'
  | 'Completed'
  | 'Cancelled';

export interface PartnerBooking {
  id: string;
  userId: string;
  userName: string;
  userMobile: string;
  surveyNumber: string;
  district: string;
  mandal: string;
  village: string;
  pincode: string;
  equipmentType: string;
  date: string;
  time: string;
  status: PartnerBookingStatus;
  partnerId?: string;
  partnerType?: string;
  pricingTypeId?: string;
  quantity?: number;
  totalAmount: number;
  startWorkPhotos?: string[];
  completeWorkPhotos?: string[];
  progressUpdates?: ProgressUpdate[];
  customFieldResponses?: Record<string, string>;
  paymentStatus?: 'Paid' | 'Pending';
}


