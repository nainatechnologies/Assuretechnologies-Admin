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
  const [discount, setDiscount] = useState('');
  const [priceError, setPriceError] = useState('');
  const [description, setDescription] = useState('');
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [bannerName, setBannerName] = useState('');
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);

  const bannerInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (product) {
      setName(product.name || '');
      setCategory(CATEGORIES.includes(product.category) ? product.category : CATEGORIES[0]);
      // Extract numeric value from price string (e.g., "₹299.00" -> "299.00")
      const cleanPrice = product.price ? product.price.replace(/[^0-9.]/g, '') : '';
      setPrice(cleanPrice);
      setDiscount(product.discount ? product.discount.toString() : '');
      setPriceError('');
      setDescription(product.description || '');
      setBannerName(product.bannerName || 'No file chosen');
      setBannerFile(null);

      if (product.banner instanceof File) {
        setBannerPreview(URL.createObjectURL(product.banner));
      } else if (typeof product.banner === 'string' && product.banner) {
        setBannerPreview(product.banner);
      } else {
        setBannerPreview(null);
      }
    }
  }, [product]);

  useEffect(() => {
    return () => {
      if (bannerPreview && bannerPreview.startsWith('blob:')) {
        URL.revokeObjectURL(bannerPreview);
      }
    };
  }, [bannerPreview]);

  if (!isOpen || !product) return null;

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val === '' || /^\d*\.?\d*$/.test(val)) {
      setPrice(val);
      setPriceError('');
    }
  };

  const handleDiscountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val === '' || (/^\d*\.?\d*$/.test(val) && Number(val) <= 100)) {
      setDiscount(val);
    }
  };

  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setBannerFile(file);
      setBannerName(file.name);
      setBannerPreview(URL.createObjectURL(file));
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
      discount: discount ? parseFloat(discount) : 0,
      description,
      banner: bannerFile || product.banner,
      bannerName: bannerName || product.bannerName || 'No file chosen'
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
                className="input-field colorful-input"
                placeholder="Enter product name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            {/* Category */}
            <div className="input-group form-group">
              <label className="input-label" htmlFor="editCategory">Category</label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <select
                  id="editCategory"
                  className="input-field category-select colorful-input"
                  style={{ width: '100%', paddingRight: '40px' }}
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  required
                >
                  <option value="" disabled hidden>Select Category...</option>
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Price (Numeric Validation) */}
            <div className="input-group form-group">
              <label className="input-label" htmlFor="editPrice">Price</label>
              <input
                type="text"
                id="editPrice"
                className="input-field colorful-input"
                placeholder="299.00"
                value={price}
                onChange={handlePriceChange}
                required
              />
              {priceError && <div className="input-error" style={{ marginTop: '4px', marginBottom: 0 }}>{priceError}</div>}
            </div>

            {/* Discount */}
            <div className="input-group form-group">
              <label className="input-label" htmlFor="editDiscount">Discount (%)</label>
              <input
                type="text"
                id="editDiscount"
                className="input-field colorful-input"
                placeholder="e.g. 10"
                value={discount}
                onChange={handleDiscountChange}
              />
            </div>

            {/* Banner Image */}
            <div className="input-group form-group">
              <label className="input-label">Banner Image</label>
              <div
                className="modern-file-input"
                onClick={() => bannerInputRef.current?.click()}
              >
                <div className="modern-file-btn">Choose File</div>
                {bannerPreview ? (
                  <img
                    src={bannerPreview}
                    alt="Preview"
                    style={{ height: '40px', width: 'auto', borderRadius: '4px', marginLeft: '12px', objectFit: 'cover' }}
                  />
                ) : (
                  <div className="modern-file-name" title={bannerName}>
                    {bannerName}
                  </div>
                )}
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

            {/* Description */}
            <div className="input-group form-group-full">
              <label className="input-label" htmlFor="editDescription">
                Description <span className="char-count" style={{ color: description.length > 100 ? '#ef4444' : 'var(--text-muted)' }}>({description.length}/100)</span>
              </label>
              <textarea
                id="editDescription"
                className="input-field textarea-field colorful-input"
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
