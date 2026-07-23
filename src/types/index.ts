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
