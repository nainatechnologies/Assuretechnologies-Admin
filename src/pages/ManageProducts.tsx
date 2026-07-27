import { useState, useMemo } from 'react';
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
  const [isAdding, setIsAdding] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const handleAddProduct = (newProductData: Omit<Product, 'id' | 'status'>) => {
    const newProduct: Product = {
      ...newProductData,
      id: Math.random().toString(36).substring(2, 9),
      status: 'In Stock'
    };

    setProducts(prevProducts => [...prevProducts, newProduct]);
    setIsAdding(false);
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

  const filteredProducts = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return products.filter(p => 
      p.name.toLowerCase().includes(query) ||
      p.category.toLowerCase().includes(query) ||
      p.description.toLowerCase().includes(query)
    );
  }, [products, searchQuery]);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div>
      <div className="manage-products-header" style={{ flexWrap: 'wrap', gap: '15px' }}>
        <h1 className="page-title manage-products-title">Manage Products</h1>
        <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
          <input
            type="text"
            placeholder="Search by name, category..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            style={{
              padding: '10px 15px',
              borderRadius: '8px',
              border: '1px solid #ccc',
              minWidth: '250px'
            }}
          />
          <button
            onClick={() => setIsAdding(!isAdding)}
            style={{
              padding: '10px 20px',
              borderRadius: '8px',
              border: 'none',
              background: isAdding ? '#ef4444' : '#4F46E5',
              color: 'white',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            {isAdding ? 'Cancel' : '+ Add Product'}
          </button>
        </div>
      </div>

      {/* Product Form Component */}
      {isAdding && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex', justifyContent: 'center', alignItems: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{ width: '100%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto', position: 'relative' }}>
             <button 
               onClick={() => setIsAdding(false)}
               style={{ position: 'absolute', top: '25px', right: '25px', background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', zIndex: 10, color: '#64748b' }}
             >
               &times;
             </button>
             <ProductForm onAddProduct={handleAddProduct} />
          </div>
        </div>
      )}

      {/* Product Table Component */}
      <ProductTable
        products={paginatedProducts}
        onEditProduct={handleEditProduct}
        onDeleteProduct={handleDeleteProduct}
      />

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px', gap: '10px', alignItems: 'center' }}>
          <button 
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(p => p - 1)}
            style={{
              padding: '8px 16px',
              borderRadius: '6px',
              border: '1px solid #ccc',
              background: currentPage === 1 ? '#f1f5f9' : 'white',
              cursor: currentPage === 1 ? 'not-allowed' : 'pointer'
            }}
          >
            Previous
          </button>
          <span style={{ padding: '8px 15px', background: 'white', borderRadius: '6px', border: '1px solid #ccc', fontWeight: 500 }}>
            Page {currentPage} of {totalPages}
          </span>
          <button 
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(p => p + 1)}
            style={{
              padding: '8px 16px',
              borderRadius: '6px',
              border: '1px solid #ccc',
              background: currentPage === totalPages ? '#f1f5f9' : 'white',
              cursor: currentPage === totalPages ? 'not-allowed' : 'pointer'
            }}
          >
            Next
          </button>
        </div>
      )}

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
