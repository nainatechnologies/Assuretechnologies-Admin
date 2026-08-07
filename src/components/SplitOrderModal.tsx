import { useState, useRef, useEffect } from 'react';
import { MdClose, MdSearch } from 'react-icons/md';
import type { OrderItem } from '../types';
import './SplitOrderModal.css';

// Mock list of vendors for the dropdown
const AVAILABLE_VENDORS = [
  { id: 'VEND0001', fullName: 'admin', businessName: 'Naina-tech' },
  { id: 'VEND0002', fullName: 'admin2', businessName: 'Naina-tech2' },
  { id: 'VEND0003', fullName: 'admin3', businessName: 'Naina-tech3' },
  { id: 'VEND0004', fullName: 'John Doe', businessName: 'Vendor D' },
  { id: 'VEND0005', fullName: 'Jane Smith', businessName: 'Vendor E' }
];

interface SplitOrderModalProps {
  orderId: string;
  item: OrderItem;
  onClose: () => void;
  onSplit: (orderId: string, originalItemId: string, newVendorName: string, transferQty: number) => void;
}

export default function SplitOrderModal({ orderId, item, onClose, onSplit }: SplitOrderModalProps) {
  const [splitQty, setSplitQty] = useState<number | string>(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState<{id: string, businessName: string} | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const maxQty = item.qty; // Can split or reassign the entire quantity

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredVendors = AVAILABLE_VENDORS.filter(v => 
    v.businessName !== item.vendorName && // Exclude current vendor
    (
      v.businessName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.fullName.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  const handleSubmit = () => {
    const qty = typeof splitQty === 'string' ? parseInt(splitQty) : splitQty;
    if (!isNaN(qty) && qty > 0 && qty <= maxQty && selectedVendor) {
      onSplit(orderId, item.id, selectedVendor.businessName, qty);
    }
  };

  return (
    <div className="split-modal-overlay">
      <div className="split-modal-content">
        <div className="split-modal-header">
          <h2>Split Order Item</h2>
          <button className="split-close-btn" onClick={onClose}>
            <MdClose />
          </button>
        </div>

        <div className="split-modal-body">
          <div className="split-item-info">
            <p><strong>Product:</strong> {item.productName}</p>
            <p><strong>Current Vendor:</strong> {item.vendorName}</p>
            <p><strong>Total Quantity:</strong> {item.qty}</p>
          </div>

          <div className="split-form-group">
            <label>Quantity to Reassign (Max: {maxQty})</label>
            <input 
              type="number" 
              className="split-form-input" 
              min={1}
              max={maxQty}
              value={splitQty}
              onChange={(e) => setSplitQty(e.target.value)}
              onBlur={(e) => {
                let val = parseInt(e.target.value);
                if (isNaN(val) || val < 1) val = 1;
                if (val > maxQty) val = maxQty;
                setSplitQty(val);
              }}
            />
          </div>

          <div className="split-form-group" ref={dropdownRef}>
            <label>Search New Vendor (by Name or Business)</label>
            <div className="split-search-wrapper">
              <MdSearch className="split-search-icon" size={20} />
              <input 
                type="text"
                className="split-form-input split-search-input"
                placeholder="Type to search..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setIsDropdownOpen(true);
                  setSelectedVendor(null); // Clear selection when searching
                }}
                onFocus={() => setIsDropdownOpen(true)}
              />

              {isDropdownOpen && (
                <div className="split-vendor-dropdown">
                  {filteredVendors.length > 0 ? (
                    filteredVendors.map(vendor => (
                      <div 
                        key={vendor.id} 
                        className="split-vendor-option"
                        onClick={() => {
                          setSelectedVendor(vendor);
                          setSearchQuery(vendor.businessName);
                          setIsDropdownOpen(false);
                        }}
                      >
                        <div className="split-vendor-business">{vendor.businessName}</div>
                        <div className="split-vendor-name">{vendor.fullName}</div>
                      </div>
                    ))
                  ) : (
                    <div className="split-vendor-empty">No vendors found matching "{searchQuery}"</div>
                  )}
                </div>
              )}
            </div>
            
            {/* Display selected vendor clearly if one is chosen */}
            {selectedVendor && (
              <div className="split-selected-vendor">
                Selected: <strong>{selectedVendor.businessName}</strong>
              </div>
            )}
          </div>
        </div>

        <div className="split-modal-footer">
          <button className="split-cancel-btn" onClick={onClose}>Cancel</button>
          <button 
            className="split-submit-btn" 
            onClick={handleSubmit}
            disabled={Number(splitQty) < 1 || Number(splitQty) > maxQty || !selectedVendor}
          >
            Confirm Split
          </button>
        </div>
      </div>
    </div>
  );
}
