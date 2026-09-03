import { useState, useEffect } from 'react';
import { MdClose, MdVisibility, MdDownload } from 'react-icons/md';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import Swal from 'sweetalert2';
import { quotationsApi, type CreateQuotationPayload } from '../services/quotationsApi';
import type { Quotation, QuotationService } from '../types';
import './ManageQuotations.css';

export default function ManageQuotations() {
  const [activeTab, setActiveTab] = useState<'table' | 'form' | 'view'>('table');
  const [viewingQuotation, setViewingQuotation] = useState<Quotation | null>(null);
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [loading, setLoading] = useState(false);

  // Form State
  const [customerName, setCustomerName] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [gstNumber, setGstNumber] = useState('');
  const [address, setAddress] = useState('');
  const [pincode, setPincode] = useState('');

  const [services, setServices] = useState<QuotationService[]>([
    { id: '1', name: '', qty: 1, cost: 0, total: 0 }
  ]);

  const [additionalChargesDesc, setAdditionalChargesDesc] = useState('');
  const [additionalCharges, setAdditionalCharges] = useState<number>(0);
  const [gstPercent, setGstPercent] = useState<number>(18);

  // Derived calculations
  const servicesTotal = services.reduce((sum, s) => sum + (s.qty * s.cost), 0);
  const totalBeforeGst = servicesTotal + (additionalCharges || 0);
  const gstAmount = (totalBeforeGst * gstPercent) / 100;
  const grandTotal = totalBeforeGst + gstAmount;

  useEffect(() => {
    fetchQuotations();
  }, []);

  const fetchQuotations = async () => {
    try {
      setLoading(true);
      const res = await quotationsApi.getQuotations();
      if (res.data) {
        const mapped: Quotation[] = res.data.map((q: any) => ({
          id: q.id,
          quotationNumber: q.quotation_number,
          customerName: q.customer_name,
          mobile: q.mobile,
          email: q.email || '',
          companyName: q.company_name || '',
          gstNumber: q.gst_number || '',
          address: q.address || '',
          pincode: q.pincode || '',
          subtotal: parseFloat(q.subtotal || 0),
          additionalChargesDesc: q.additional_charges_desc || '',
          additionalCharges: parseFloat(q.additional_charges || 0),
          gstPercent: parseFloat(q.gst_percent || 18),
          grandTotal: parseFloat(q.grand_total || 0),
          services: (q.items || []).map((it: any) => ({
            id: it.id,
            name: it.service_name,
            qty: it.qty,
            cost: parseFloat(it.cost || 0),
            total: parseFloat(it.total || 0)
          })),
          date: q.createdAt ? new Date(q.createdAt).toLocaleDateString() : ''
        }));
        setQuotations(mapped);
      }
    } catch (err: any) {
      console.error('Failed to fetch quotations:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddRow = () => {
    setServices([
      ...services,
      { id: Date.now().toString(), name: '', qty: 1, cost: 0, total: 0 }
    ]);
  };

  const handleRemoveRow = (id: string) => {
    if (services.length > 1) {
      setServices(services.filter(s => s.id !== id));
    }
  };

  const handleServiceChange = (id: string, field: keyof QuotationService, value: any) => {
    setServices(services.map(s => {
      if (s.id === id) {
        const updated = { ...s, [field]: value };
        if (field === 'qty' || field === 'cost') {
          const q = field === 'qty' ? parseInt(value) || 0 : s.qty;
          const c = field === 'cost' ? parseFloat(value) || 0 : s.cost;
          updated.total = q * c;
        }
        return updated;
      }
      return s;
    }));
  };

  const handleSaveQuotation = async () => {
    if (!customerName.trim()) {
      Swal.fire({ icon: 'warning', title: 'Missing Details', text: 'Please enter Customer Name.' });
      return;
    }

    const cleanMobile = mobile.replace(/\D/g, '');
    if (cleanMobile.length !== 10) {
      Swal.fire({ icon: 'warning', title: 'Invalid Mobile', text: 'Please enter a valid 10-digit mobile number.' });
      return;
    }

    if (gstNumber.trim() && gstNumber.trim().length !== 15) {
      Swal.fire({ icon: 'warning', title: 'Invalid GSTIN', text: 'GST Number must be 15 characters.' });
      return;
    }

    if (pincode.trim() && pincode.trim().length !== 6) {
      Swal.fire({ icon: 'warning', title: 'Invalid Pincode', text: 'Pincode must be 6 digits.' });
      return;
    }

    const validServices = services.filter(s => s.name.trim() && s.cost > 0);
    if (validServices.length === 0) {
      Swal.fire({ icon: 'warning', title: 'Missing Service Details', text: 'Please add at least one service with a name and cost.' });
      return;
    }

    try {
      const payload: CreateQuotationPayload = {
        customer_name: customerName.trim(),
        mobile: cleanMobile,
        email: email.trim() || undefined,
        company_name: companyName.trim() || undefined,
        gst_number: gstNumber.trim().toUpperCase() || undefined,
        address: address.trim() || undefined,
        pincode: pincode.trim() || undefined,
        services: validServices.map(s => ({
          service_name: s.name.trim(),
          sac_code: '9987',
          qty: s.qty,
          cost: s.cost
        })),
        additional_charges_desc: additionalChargesDesc.trim() || undefined,
        additional_charges: additionalCharges || 0,
        gst_percent: gstPercent
      };

      await quotationsApi.createQuotation(payload);
      
      Swal.fire({
        icon: 'success',
        title: 'Quotation Generated!',
        timer: 1500,
        showConfirmButton: false
      });

      // Reset Form
      setCustomerName('');
      setMobile('');
      setEmail('');
      setCompanyName('');
      setGstNumber('');
      setAddress('');
      setPincode('');
      setServices([{ id: Date.now().toString(), name: '', qty: 1, cost: 0, total: 0 }]);
      setAdditionalChargesDesc('');
      setAdditionalCharges(0);
      setGstPercent(18);

      // Refresh list & switch to table
      await fetchQuotations();
      setActiveTab('table');
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Failed to save quotation';
      Swal.fire({ icon: 'error', title: 'Error', text: msg });
    }
  };

  const handleDeleteQuotation = async (id: string) => {
    const result = await Swal.fire({
      title: 'Delete Quotation?',
      text: 'Are you sure you want to delete this quotation?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      try {
        await quotationsApi.deleteQuotation(id);
        setQuotations(quotations.filter(q => q.id !== id));
        Swal.fire({ icon: 'success', title: 'Deleted!', timer: 1200, showConfirmButton: false });
      } catch (err: any) {
        Swal.fire({ icon: 'error', title: 'Error', text: err.message });
      }
    }
  };

  const handleDownloadPDF = async (quotationNumber: string) => {
    const input = document.getElementById('quotation-details-pdf');
    if (!input) return;

    const actionButtons = input.querySelector('.pdf-exclude-buttons');
    if (actionButtons) {
      (actionButtons as HTMLElement).style.display = 'none';
    }

    try {
      const canvas = await html2canvas(input, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Quotation_${quotationNumber}.pdf`);
    } catch (err) {
      console.error('Failed to generate PDF', err);
    } finally {
      if (actionButtons) {
        (actionButtons as HTMLElement).style.display = 'flex';
      }
    }
  };

  return (
    <div className="manage-quotations">
      <h3 className="quotations-title">Quotation Management</h3>

      <div className="quotation-tabs">
        <button 
          className={`quotation-tab ${activeTab === 'table' ? 'active' : ''}`}
          onClick={() => { setActiveTab('table'); setViewingQuotation(null); }}
        >
          Quotations
        </button>
        <button 
          className={`quotation-tab ${activeTab === 'form' ? 'active' : ''}`}
          onClick={() => { setActiveTab('form'); setViewingQuotation(null); }}
        >
          Generate Quotation
        </button>
      </div>

      <div className="quotation-container">
        {activeTab === 'table' && (
          <div className="ref-table-wrapper" style={{ margin: 0 }}>
            <table className="quotations-list-table ref-table" style={{ border: 'none' }}>
              <thead>
                <tr>
                  <th>Quotation No</th>
                  <th>Customer</th>
                  <th>Mobile</th>
                  <th>Total</th>
                  <th>Date</th>
                  <th style={{ textAlign: 'center' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} style={{ padding: '30px', textAlign: 'center' }}>
                      Loading quotations...
                    </td>
                  </tr>
                ) : quotations.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: '#333' }}>
                      No quotations found
                    </td>
                  </tr>
                ) : (
                  quotations.map(q => (
                    <tr key={q.id}>
                      <td><strong>{q.quotationNumber}</strong></td>
                      <td>{q.customerName}</td>
                      <td>{q.mobile}</td>
                      <td>{q.grandTotal.toFixed(2)}</td>
                      <td>{q.date}</td>
                      <td style={{ textAlign: 'center', display: 'flex', gap: '8px', justifyContent: 'center' }}>
                        <button 
                          className="btn-action-green"
                          onClick={() => {
                            setViewingQuotation(q);
                            setActiveTab('view');
                          }}
                          style={{ padding: '4px 8px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                        >
                          <MdVisibility /> View
                        </button>
                        <button 
                          className="btn-action-green"
                          onClick={() => {
                            setViewingQuotation(q);
                            setActiveTab('view');
                            setTimeout(() => {
                              handleDownloadPDF(q.quotationNumber);
                            }, 300);
                          }}
                          style={{ padding: '4px 8px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '4px', backgroundColor: '#3b82f6' }}
                        >
                          <MdDownload /> Download
                        </button>
                        <button 
                          className="btn-remove-row"
                          onClick={() => handleDeleteQuotation(q.id)}
                          style={{ padding: '4px 8px', fontSize: '0.9rem' }}
                        >
                          <MdClose />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'form' && (
          <div>
            <h4 className="section-title">Customer Details</h4>
            
            <div className="form-grid-3">
              <input 
                type="text" 
                className="ref-input" 
                placeholder="Customer Name" 
                value={customerName} 
                onChange={e => setCustomerName(e.target.value)} 
                required 
              />
              <input 
                type="text" 
                className="ref-input" 
                placeholder="Mobile" 
                maxLength={10}
                value={mobile} 
                onChange={e => setMobile(e.target.value.replace(/\D/g, ''))} 
                required 
              />
              <input 
                type="text" 
                className="ref-input" 
                placeholder="Email" 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
              />
            </div>
            
            <div className="form-grid-2">
              <input 
                type="text" 
                className="ref-input" 
                placeholder="Company Name (Optional)" 
                value={companyName} 
                onChange={e => setCompanyName(e.target.value)} 
              />
              <input 
                type="text" 
                className="ref-input" 
                placeholder="GST Number (Optional)" 
                maxLength={15}
                value={gstNumber} 
                onChange={e => setGstNumber(e.target.value.toUpperCase())} 
              />
            </div>
            
            <div className="form-grid-1">
              <input 
                type="text" 
                className="ref-input" 
                placeholder="Address" 
                value={address} 
                onChange={e => setAddress(e.target.value)} 
              />
            </div>
            
            <div className="form-grid-1">
              <input 
                type="text" 
                className="ref-input" 
                placeholder="Pincode" 
                maxLength={6}
                value={pincode} 
                onChange={e => setPincode(e.target.value.replace(/\D/g, ''))} 
              />
            </div>

            <hr style={{ border: '0', borderTop: '1px solid #dee2e6', margin: '20px 0' }} />

            <h4 className="section-title">Service Details</h4>
            
            <div className="ref-table-wrapper">
              <table className="ref-table">
                <thead>
                  <tr>
                    <th className="col-num">#</th>
                    <th className="col-name">Service Name</th>
                    <th className="col-qty">Qty</th>
                    <th className="col-cost">Cost</th>
                    <th className="col-total">Total</th>
                    <th className="col-action"></th>
                  </tr>
                </thead>
                <tbody>
                  {services.map((svc, idx) => (
                    <tr key={svc.id}>
                      <td className="col-num">{idx + 1}</td>
                      <td>
                        <input 
                          type="text" 
                          className="ref-input"
                          value={svc.name}
                          onChange={e => handleServiceChange(svc.id, 'name', e.target.value)}
                        />
                      </td>
                      <td>
                        <input 
                          type="number" 
                          className="ref-input"
                          value={svc.qty || ''}
                          onChange={e => handleServiceChange(svc.id, 'qty', parseInt(e.target.value) || 0)}
                        />
                      </td>
                      <td>
                        <input 
                          type="number" 
                          className="ref-input"
                          value={svc.cost || ''}
                          onChange={e => handleServiceChange(svc.id, 'cost', parseFloat(e.target.value) || 0)}
                        />
                      </td>
                      <td>
                        <div className="ref-input" style={{ background: '#e9ecef', border: '1px solid transparent', color: '#495057' }}>
                          {svc.total.toFixed(2)}
                        </div>
                      </td>
                      <td className="col-action">
                        <button type="button" className="btn-remove-row" onClick={() => handleRemoveRow(svc.id)}>
                          <MdClose />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <button type="button" className="btn-add-row" onClick={handleAddRow}>
              + Add Row
            </button>

            <div className="calc-grid-2">
              <input 
                type="text" 
                className="ref-input" 
                placeholder="Additional Charges Description" 
                value={additionalChargesDesc}
                onChange={e => setAdditionalChargesDesc(e.target.value)}
              />
              <input 
                type="number" 
                className="ref-input" 
                placeholder="0" 
                value={additionalCharges || ''}
                onChange={e => setAdditionalCharges(parseFloat(e.target.value) || 0)}
              />
            </div>

            <div className="calc-grid-3">
              <input 
                type="number" 
                className="ref-input" 
                placeholder="18" 
                value={gstPercent}
                onChange={e => setGstPercent(parseFloat(e.target.value) || 0)}
              />
              <div className="ref-readonly">
                {gstAmount.toFixed(2)}
              </div>
              <div className="ref-readonly">
                {grandTotal.toFixed(2)}
              </div>
            </div>

            <div className="terms-box">
              <p>• This quotation is valid for 7 days</p>
              <p>• GST applicable as per norms</p>
              <p>• Prices subject to approval</p>
            </div>

            <button className="btn-save-quotation" onClick={handleSaveQuotation}>
              Save Quotation
            </button>
          </div>
        )}

        {activeTab === 'view' && viewingQuotation && (
          <div id="quotation-details-pdf" style={{ padding: '20px', background: 'white' }}>
            <div className="pdf-exclude-buttons" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <h4 className="section-title" style={{ margin: 0 }}>Quotation Details</h4>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  className="btn-action-green"
                  style={{ width: 'auto', padding: '4px 12px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#3b82f6' }}
                  onClick={() => handleDownloadPDF(viewingQuotation.quotationNumber)}
                >
                  <MdDownload /> Download PDF
                </button>
                <button
                  className="btn-remove-row"
                  style={{ width: 'auto', padding: '4px 12px', fontSize: '0.85rem' }}
                  onClick={() => {
                    setActiveTab('table');
                    setViewingQuotation(null);
                  }}
                >
                  Back to List
                </button>
              </div>
            </div>
            
            <div style={{ background: '#f8f9fa', padding: '15px', borderRadius: '4px', marginBottom: '20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div><strong>Quotation No:</strong> {viewingQuotation.quotationNumber}</div>
              <div><strong>Date:</strong> {viewingQuotation.date}</div>
              <div><strong>Customer:</strong> {viewingQuotation.customerName}</div>
              <div><strong>Mobile:</strong> {viewingQuotation.mobile}</div>
              <div><strong>Email:</strong> {viewingQuotation.email || 'N/A'}</div>
              <div><strong>Company Name:</strong> {viewingQuotation.companyName || 'N/A'}</div>
              <div><strong>GST Number:</strong> {viewingQuotation.gstNumber || 'N/A'}</div>
              <div><strong>Address:</strong> {viewingQuotation.address || 'N/A'}</div>
              <div><strong>Pincode:</strong> {viewingQuotation.pincode || 'N/A'}</div>
            </div>

            <h4 className="section-title">Service Details</h4>
            <div className="ref-table-wrapper">
              <table className="ref-table">
                <thead>
                  <tr>
                    <th className="col-num">#</th>
                    <th className="col-name">Service Name</th>
                    <th className="col-qty">Qty</th>
                    <th className="col-cost">Cost</th>
                    <th className="col-total">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {viewingQuotation.services.map((svc, idx) => (
                    <tr key={svc.id}>
                      <td className="col-num">{idx + 1}</td>
                      <td>{svc.name}</td>
                      <td>{svc.qty}</td>
                      <td>{svc.cost.toFixed(2)}</td>
                      <td>{svc.total.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {(() => {
              const servicesTotal = viewingQuotation.services.reduce((sum, s) => sum + s.total, 0);
              const totalBeforeGst = servicesTotal + viewingQuotation.additionalCharges;
              const gstAmount = (totalBeforeGst * viewingQuotation.gstPercent) / 100;
              return (
                <div style={{ marginTop: '20px', padding: '15px', background: '#e9ecef', borderRadius: '4px', textAlign: 'right' }}>
                  <p><strong>Services Total:</strong> {servicesTotal.toFixed(2)}</p>
                  <p><strong>Additional Charges {viewingQuotation.additionalChargesDesc ? `(${viewingQuotation.additionalChargesDesc})` : ''}:</strong> {viewingQuotation.additionalCharges.toFixed(2)}</p>
                  <p><strong>GST ({viewingQuotation.gstPercent}%):</strong> {gstAmount.toFixed(2)}</p>
                  <h4><strong>Grand Total:</strong> {viewingQuotation.grandTotal.toFixed(2)}</h4>
                </div>
              );
            })()}
          </div>
        )}
      </div>
    </div>
  );
}
