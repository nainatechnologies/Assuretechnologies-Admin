import { useState } from 'react';
import ProductForm from '../components/ProductForm';
import ProductTable from '../components/ProductTable';
import EditProductModal from '../components/EditProductModal';
import type { Product } from '../types';
import Swal from 'sweetalert2';
import './ManageProducts.css';

export default function ManageProducts() {
  const [products, setProducts] = useState<Product[]>([
    {
      id: '1',
      name: 'High-Speed Wireless Router',
      category: 'Networking',
      price: '₹299.00',
      banner: '',
      bannerName: 'router.png',
      description: 'High-quality dual-band wireless router with gigabit speeds.',
      status: 'In Stock'
    },
    {
      id: '2',
      name: 'Smart Home Automation Hub',
      category: 'Automation',
      price: '₹89.00',
      banner: '',
      bannerName: 'hub.jpg',
      description: 'Modern smart automation controller for connected devices.',
      status: 'In Stock'
    }
  ]);

  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const handleAddProduct = (newProductData: Omit<Product, 'id' | 'status'>) => {
    const newProduct: Product = {
      ...newProductData,
      id: Math.random().toString(36).substring(2, 9),
      status: 'In Stock'
    };

    setProducts(prevProducts => [...prevProducts, newProduct]);
    Swal.fire({
      title: 'Added!',
      text: 'New product added successfully.',
      icon: 'success',
      confirmButtonColor: '#4F46E5',
      timer: 2000,
      showConfirmButton: false
    });
  };

  const handleEditProduct = (id: string) => {
    const targetProduct = products.find(p => p.id === id);
    if (targetProduct) {
      setEditingProduct(targetProduct);
    }
  };

  const handleUpdateProduct = (updatedProduct: Product) => {
    setProducts(prevProducts =>
      prevProducts.map(p => (p.id === updatedProduct.id ? updatedProduct : p))
    );
    setEditingProduct(null);
    Swal.fire({
      title: 'Updated!',
      text: 'Product has been updated successfully in the table.',
      icon: 'success',
      confirmButtonColor: '#4F46E5',
      timer: 2000,
      showConfirmButton: false
    });
  };

  const handleDeleteProduct = (id: string) => {
    Swal.fire({
      title: 'Delete Product?',
      text: 'Are you sure you want to delete this product?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        setProducts(prevProducts => prevProducts.filter(p => p.id !== id));
        Swal.fire({
          title: 'Deleted!',
          text: 'Product removed successfully.',
          icon: 'success',
          confirmButtonColor: '#4F46E5',
          timer: 1500,
          showConfirmButton: false
        });
      }
    });
  };

  return (
    <div>
      <div className="manage-products-header">
        <h1 className="page-title manage-products-title">Manage Products</h1>
      </div>

      {/* Product Form Component */}
      <ProductForm onAddProduct={handleAddProduct} />

      {/* Product Table Component */}
      <ProductTable
        products={products}
        onEditProduct={handleEditProduct}
        onDeleteProduct={handleDeleteProduct}
      />

      {/* Edit Product Modal */}
      {editingProduct && (
        <EditProductModal
          product={editingProduct}
          isOpen={Boolean(editingProduct)}
          onClose={() => setEditingProduct(null)}
          onUpdateProduct={handleUpdateProduct}
        />
      )}
    </div>
  );
}
