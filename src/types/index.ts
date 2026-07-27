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
}

export interface Service {
  id: string;
  category: string;
  subCategory: string;
  image: string | File;
  imageName: string;
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
