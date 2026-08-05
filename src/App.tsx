import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import AdminLayout from './layouts/AdminLayout';
import Dashboard from './pages/Dashboard';
import ManageProducts from './pages/ManageProducts';
import ManageOrders from './pages/ManageOrders';
import ManageVendorOrders from './pages/ManageVendorOrders';
import ManageTechnicians from './pages/ManageTechnicians';
import ManageVendors from './pages/ManageVendors';
import ManageServices from './pages/ManageServices';
import ManageServiceAssignments from './pages/ManageServiceAssignments';
import ManageServiceRequests from './pages/ManageServiceRequests';
import ManageQuotations from './pages/ManageQuotations';
import ManageInvoices from './pages/ManageInvoices';
import ManagePayments from './pages/ManagePayments';
import ManageStock from './pages/ManageStock';
import ManagePartners from './pages/ManagePartners';
import ManagePartnerTypes from './pages/ManagePartnerTypes';
import ManagePartnerServices from './pages/ManagePartnerServices';
import ManagePartnerAssignments from './pages/ManagePartnerAssignments';
import ManagePartnerRequests from './pages/ManagePartnerRequests';
import JobPortal from './pages/JobPortal';
import { PartnerProvider } from './context/PartnerContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import './App.css';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <PartnerProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Login />} />
            
            {/* Admin Routes with Layout */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="products" element={<ManageProducts />} />
              <Route path="orders" element={<ManageOrders />} />
              <Route path="vendor-orders" element={<ManageVendorOrders />} />
              <Route path="service-assignments" element={<ManageServiceAssignments />} />
              <Route path="service-requests" element={<ManageServiceRequests />} />
              <Route path="services" element={<ManageServices />} />
              <Route path="quotations" element={<ManageQuotations />} />
              <Route path="invoices" element={<ManageInvoices />} />
              <Route path="payments" element={<ManagePayments />} />
              <Route path="technicians" element={<ManageTechnicians />} />
              <Route path="vendors" element={<ManageVendors />} />
              <Route path="partner-types" element={<ManagePartnerTypes />} />
              <Route path="partner-services" element={<ManagePartnerServices />} />
              <Route path="partners" element={<ManagePartners />} />
              <Route path="partner-assignments" element={<ManagePartnerAssignments />} />
              <Route path="partner-requests" element={<ManagePartnerRequests />} />
              <Route path="stock" element={<ManageStock />} />
              <Route path="job-portal" element={<JobPortal />} />
            </Route>
            
            {/* Fallback route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </PartnerProvider>
    </QueryClientProvider>
  );
}

export default App;
