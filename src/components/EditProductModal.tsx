import React, { useState, useRef, useEffect } from 'react';
import type { Product } from '../types';
import { CATEGORIES } from './ProductForm';
import { MdClose } from 'react-icons/md';
import './EditProductModal.css';

interface EditProductModalProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
  onUpdateProduct: (updatedProduct: Product) => void;
}

export default function EditProductModal({
  product,
  isOpen,
  onClose,
  onUpdateProduct
}: EditProductModalProps) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [price, setPrice] = useState('');
  const [priceError, setPriceError] = useState('');
  const [description, setDescription] = useState('');
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [bannerName, setBannerName] = useState('');
  const [additionalFile, setAdditionalFile] = useState<File | null>(null);
  const [additionalImageName, setAdditionalImageName] = useState('');

  const bannerInputRef = useRef<HTMLInputElement>(null);
  const additionalInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (product) {
      setName(product.name || '');
      setCategory(CATEGORIES.includes(product.category) ? product.category : CATEGORIES[0]);
      // Extract numeric value from price string (e.g., "₹299.00" -> "299.00")
      const cleanPrice = product.price ? product.price.replace(/[^0-9.]/g, '') : '';
      setPrice(cleanPrice);
      setPriceError('');
      setDescription(product.description || '');
      setBannerName(product.bannerName || 'No file chosen');
      setAdditionalImageName(product.additionalImageName || 'No file chosen');
      setBannerFile(null);
      setAdditionalFile(null);
    }
  }, [product]);

  if (!isOpen || !product) return null;

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val === '' || /^\d*\.?\d*$/.test(val)) {
      setPrice(val);
      setPriceError('');
    }
  };

  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setBannerFile(file);
      setBannerName(file.name);
    }
  };

  const handleAdditionalImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setAdditionalFile(file);
      setAdditionalImageName(file.name);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price || !description) return;

    if (isNaN(Number(price)) || Number(price) <= 0) {
      setPriceError('Please enter a valid numeric price');
      return;
    }

    const updatedProduct: Product = {
      ...product,
      name,
      category,
      price: `₹${parseFloat(price).toFixed(2)}`,
      description,
      banner: bannerFile || product.banner,
      bannerName: bannerName || product.bannerName || 'No file chosen',
      additionalImage: additionalFile || product.additionalImage,
      additionalImageName: additionalImageName || product.additionalImageName || 'No file chosen'
    };

    onUpdateProduct(updatedProduct);
    onClose();
  };

  return (
    <div className="modal-overlay animate-fade-in" onClick={onClose}>
      <div className="modal-content glass-panel" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Edit Product</h2>
          <button type="button" className="close-btn" onClick={onClose}>
            <MdClose />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-form-grid">

            {/* Product Name */}
            <div className="input-group form-group">
              <label className="input-label" htmlFor="editProductName">Product Name</label>
              <input
                type="text"
                id="editProductName"
                className="input-field"
                placeholder="Enter product name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            {/* Category */}
            <div className="input-group form-group">
              <label className="input-label" htmlFor="editCategory">Category</label>
              <select
                id="editCategory"
                className="input-field category-select"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
              >
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Price (Numeric Validation) */}
            <div className="input-group form-group">
              <label className="input-label" htmlFor="editPrice">Price (Numbers only)</label>
              <input
                type="text"
                id="editPrice"
                className="input-field"
                placeholder="299.00"
                value={price}
                onChange={handlePriceChange}
                required
              />
              {priceError && <div className="input-error" style={{ marginTop: '4px', marginBottom: 0 }}>{priceError}</div>}
            </div>

            {/* Banner Image */}
            <div className="input-group form-group">
              <label className="input-label" htmlFor="editBanner">Banner Image</label>
              <div className="file-input-wrapper">
                <button
                  type="button"
                  onClick={() => bannerInputRef.current?.click()}
                  className="input-field file-input-btn"
                >
                  Choose File
                </button>
                <span className="file-name" title={bannerName}>
                  {bannerName}
                </span>
                <input
                  type="file"
                  id="editBanner"
                  ref={bannerInputRef}
                  onChange={handleBannerChange}
                  className="file-input-hidden"
                  accept="image/*"
                />
              </div>
            </div>

            {/* Add Image */}
            <div className="input-group form-group">
              <label className="input-label" htmlFor="editAddImage">Add Image</label>
              <div className="file-input-wrapper">
                <button
                  type="button"
                  onClick={() => additionalInputRef.current?.click()}
                  className="input-field file-input-btn"
                >
                  Choose File
                </button>
                <span className="file-name" title={additionalImageName}>
                  {additionalImageName}
                </span>
                <input
                  type="file"
                  id="editAddImage"
                  ref={additionalInputRef}
                  onChange={handleAdditionalImageChange}
                  className="file-input-hidden"
                  accept="image/*"
                />
              </div>
            </div>

            {/* Description */}
            <div className="input-group form-group-full">
              <label className="input-label" htmlFor="editDescription">
                Description <span className="char-count" style={{ color: description.length > 100 ? '#ef4444' : 'var(--text-muted)' }}>({description.length}/100)</span>
              </label>
              <textarea
                id="editDescription"
                className="input-field textarea-field"
                placeholder="Enter product description (max 100 chars)..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={100}
                rows={3}
                required
              />
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary update-btn">
              Update
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
