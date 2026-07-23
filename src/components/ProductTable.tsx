import type { Product } from '../types';
import './ProductTable.css';

interface ProductTableProps {
  products: Product[];
  onEditProduct: (id: string) => void;
  onDeleteProduct: (id: string) => void;
}

export default function ProductTable({ products, onEditProduct, onDeleteProduct }: ProductTableProps) {
  if (products.length === 0) {
    return (
      <div className="glass-panel product-table-empty">
        No products found. Add a product to get started.
      </div>
    );
  }

  return (
    <div className="glass-panel product-table-wrapper">
      <div className="product-table-scroll">
        <table className="product-table">
          <thead>
            <tr>
              <th className="id-col">ID</th>
              <th>Product</th>
              <th>Category</th>
              <th>Banner</th>
              <th>Price</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id}>
                <td className="product-id">#{product.id}</td>
                <td>
                  <div className="product-name">{product.name}</div>
                  <div className="product-desc">{product.description}</div>
                </td>
                <td>
                  <span className="product-category-badge">
                    {product.category}
                  </span>
                </td>
                <td className="product-banner">
                  {product.bannerName}
                </td>
                <td className="product-price">{product.price}</td>
                <td>
                  <div className="product-actions">
                    <button
                      onClick={() => onEditProduct(product.id)}
                      className="action-btn edit-btn"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => onDeleteProduct(product.id)}
                      className="action-btn delete-btn"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
