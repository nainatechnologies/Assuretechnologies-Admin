import { useState, useMemo } from 'react';
import { MdSearch } from 'react-icons/md';
import Swal from 'sweetalert2';
import type { Product } from '../types';
import './ManageStock.css';
import { createPortal } from 'react-dom';

// Mock data (Normally fetched from API)
const initialProducts: Product[] = [
  {
    id: '#1',
    name: 'camera',
    category: 'CC Camera Cable',
    price: '10000.00',
    banner: 'https://via.placeholder.com/50',
    bannerName: 'camera.png',
    description: 'CC Camera Cable',
    status: 'In Stock',
    stock: 1, // Currently low stock
  },
  {
    id: '#2',
    name: 'lens',
    category: 'CC Camera Cable',
    price: '5000.00',
    banner: 'https://via.placeholder.com/50',
    bannerName: 'lens.png',
    description: 'Camera lens',
    status: 'In Stock',
    stock: 15,
  }
];

export default function ManageStock() {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredProducts = useMemo(() => {
    return products.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [products, searchQuery]);

  const handleAddStock = (product: Product) => {
    setSelectedProduct(product);
    setQuantity('');
  };

  const handleSaveStock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;

    const qty = parseInt(quantity, 10);
    if (isNaN(qty) || qty <= 0) {
      Swal.fire('Error', 'Please enter a valid quantity greater than 0.', 'error');
      return;
    }

    setProducts(products.map(p => {
      if (p.id === selectedProduct.id) {
        return {
          ...p,
          stock: (p.stock || 0) + qty
        };
      }
      return p;
    }));

    Swal.fire('Success', 'Stock updated successfully.', 'success');
    setSelectedProduct(null);
  };

  const getStockBadge = (stockCount?: number) => {
    const count = stockCount || 0;
    if (count === 0) {
      return <span className="stock-badge out">Out of Stock</span>;
    }
    if (count < 5) {
      return <span className="stock-badge low">Low: {count}</span>;
    }
    return <span className="stock-badge ok">In Stock: {count}</span>;
  };

  const renderModal = () => {
    if (!selectedProduct) return null;

    const modalContent = (
      <div className="modal-overlay" onClick={() => setSelectedProduct(null)}>
        <div className="modal-content stock-modal" onClick={e => e.stopPropagation()}>
          <div className="modal-header">
            <h2>Add Stock – {selectedProduct.name}</h2>
            <button className="close-btn" onClick={() => setSelectedProduct(null)}>&times;</button>
          </div>
          <form onSubmit={handleSaveStock} className="modal-body">
            <div className="input-group">
              <label className="input-label">Enter Quantity</label>
              <input
                type="number"
                className="input-field"
                placeholder="e.g. 10"
                value={quantity}
                onChange={e => setQuantity(e.target.value)}
                autoFocus
              />
            </div>
            <div className="modal-footer stock-modal-footer">
              <button type="submit" className="btn-primary save-stock-btn">Save Stock</button>
            </div>
          </form>
        </div>
      </div>
    );

    return createPortal(modalContent, document.body);
  };

  return (
    <div className="manage-stock-page page-content">
      <div className="manage-stock-header">
        <h1>Manage Product Stock</h1>
        <div className="stock-search-wrapper">
          <MdSearch className="stock-search-icon" size={20} />
          <input
            type="text"
            placeholder="Search products..."
            className="stock-search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="content-card stock-card">
        <table className="stock-table">
          <thead>
            <tr>
              <th>Image</th>
              <th>Product Name</th>
              <th>Current Stock</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map(product => (
              <tr key={product.id}>
                <td>
                  <div className="stock-img-container">
                    <img
                      src={typeof product.banner === 'string' ? product.banner : URL.createObjectURL(product.banner)}
                      alt={product.name}
                    />
                  </div>
                </td>
                <td className="product-name-col">{product.name}</td>
                <td>{getStockBadge(product.stock)}</td>
                <td>
                  <button className="btn-add-stock" onClick={() => handleAddStock(product)}>
                    <span className="plus-icon">+</span> Add Stock
                  </button>
                </td>
              </tr>
            ))}
            {filteredProducts.length === 0 && (
              <tr>
                <td colSpan={4} className="empty-state">No products found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {renderModal()}
    </div>
  );
}
