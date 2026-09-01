import React, { createContext, useState, useEffect, useContext } from 'react';
import type { PartnerType, PartnerService, Partner, PricingType } from '../types';

interface PartnerContextType {
  partnerTypes: PartnerType[];
  partnerServices: PartnerService[];
  partners: Partner[];
  pricingTypes: PricingType[];
  setPartnerTypes: React.Dispatch<React.SetStateAction<PartnerType[]>>;
  setPartnerServices: React.Dispatch<React.SetStateAction<PartnerService[]>>;
  setPartners: React.Dispatch<React.SetStateAction<Partner[]>>;
  setPricingTypes: React.Dispatch<React.SetStateAction<PricingType[]>>;
}

const PartnerContext = createContext<PartnerContextType | undefined>(undefined);

const INITIAL_TYPES: PartnerType[] = [
  { id: 'pt1', name: 'Drone', customFields: [{ id: 'cf1', label: 'Drone License', type: 'file', required: true }] },
  { id: 'pt2', name: 'Tractor', customFields: [{ id: 'cf2', label: 'Vehicle Number', type: 'text', required: true }] },
  { id: 'pt3', name: 'Harvester', customFields: [{ id: 'cf3', label: 'Machine Model', type: 'text', required: true }] },
  { id: 'pt4', name: 'Rotavator', customFields: [{ id: 'cf4', label: 'Vehicle Number', type: 'text', required: true }] },
  { id: 'pt5', name: 'Seeder / Seed Drill', customFields: [{ id: 'cf5', label: 'Equipment Model', type: 'text', required: true }] },
  { id: 'pt6', name: 'Cultivator', customFields: [{ id: 'cf6', label: 'Vehicle Number', type: 'text', required: true }] },
  { id: 'pt7', name: 'Sprayer', customFields: [{ id: 'cf7', label: 'Sprayer Type', type: 'dropdown', options: ['Manual', 'Mounted', 'Self-Propelled'], required: true }] }
];

const INITIAL_PRICING_TYPES: PricingType[] = [
  { id: 'prt1', name: 'Per Acre', label: 'Number of Acres' },
  { id: 'prt2', name: 'Per Hour', label: 'Number of Hours' },
  { id: 'prt3', name: 'Per Liter', label: 'Number of Liters' },
];

const INITIAL_SERVICES: PartnerService[] = [
  { id: 'ps1', category: 'Agritech', category_id: 'cat1', serviceName: '10L Drone Spraying', pricingTypeId: 'prt1', rate: 400 },
  { id: 'ps2', category: 'Agritech', category_id: 'cat1', serviceName: 'Tractor Plowing', pricingTypeId: 'prt2', rate: 500 },
  { id: 'ps3', category: 'Agriculture', category_id: 'cat2', serviceName: 'Harvesting Machine', pricingTypeId: 'prt1', rate: 800 }
];

const INITIAL_PARTNERS: Partner[] = [
  {
    id: 'P1',
    name: 'AgriDrones AP',
    mobile: '9876543210',
    email: 'agridrones@example.com',
    location: '522001',
    status: 'Active',
    partnerTypeId: 'pt1',
    customFieldValues: { 'cf1': 'license.pdf' },
    services: ['ps1']
  },
  {
    id: 'P2',
    name: 'Balaji Tractors',
    mobile: '9988776655',
    email: 'balaji@example.com',
    location: '500081',
    status: 'Active',
    partnerTypeId: 'pt2',
    customFieldValues: { 'cf2': 'AP 07 AB 1234' },
    services: ['ps2']
  }
];

export const PartnerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [partnerTypes, setPartnerTypes] = useState<PartnerType[]>(() => {
    const saved = localStorage.getItem('assure_partnerTypes');
    return saved ? JSON.parse(saved) : INITIAL_TYPES;
  });

  const [partnerServices, setPartnerServices] = useState<PartnerService[]>(() => {
    const saved = localStorage.getItem('assure_partnerServices');
    return saved ? JSON.parse(saved) : INITIAL_SERVICES;
  });

  const [partners, setPartners] = useState<Partner[]>(() => {
    const saved = localStorage.getItem('assure_partners');
    return saved ? JSON.parse(saved) : INITIAL_PARTNERS;
  });

  const [pricingTypes, setPricingTypes] = useState<PricingType[]>(() => {
    const saved = localStorage.getItem('assure_pricingTypes');
    return saved ? JSON.parse(saved) : INITIAL_PRICING_TYPES;
  });

  useEffect(() => {
    localStorage.setItem('assure_partnerTypes', JSON.stringify(partnerTypes));
  }, [partnerTypes]);

  useEffect(() => {
    localStorage.setItem('assure_partnerServices', JSON.stringify(partnerServices));
  }, [partnerServices]);

  useEffect(() => {
    localStorage.setItem('assure_partners', JSON.stringify(partners));
  }, [partners]);

  useEffect(() => {
    localStorage.setItem('assure_pricingTypes', JSON.stringify(pricingTypes));
  }, [pricingTypes]);

  return (
    <PartnerContext.Provider value={{ partnerTypes, setPartnerTypes, partnerServices, setPartnerServices, partners, setPartners, pricingTypes, setPricingTypes }}>
      {children}
    </PartnerContext.Provider>
  );
};

export const usePartnerContext = () => {
  const context = useContext(PartnerContext);
  if (!context) {
    throw new Error('usePartnerContext must be used within a PartnerProvider');
  }
  return context;
};
