import React, { createContext, useState, useEffect, useContext } from 'react';
import type { PartnerType, PartnerService, Partner } from '../types';

interface PartnerContextType {
  partnerTypes: PartnerType[];
  partnerServices: PartnerService[];
  partners: Partner[];
  setPartnerTypes: React.Dispatch<React.SetStateAction<PartnerType[]>>;
  setPartnerServices: React.Dispatch<React.SetStateAction<PartnerService[]>>;
  setPartners: React.Dispatch<React.SetStateAction<Partner[]>>;
}

const PartnerContext = createContext<PartnerContextType | undefined>(undefined);

const INITIAL_TYPES: PartnerType[] = [
  { id: 'pt1', name: 'Drone', customFields: [{ id: 'cf1', label: 'Drone License', type: 'file', required: true }] },
  { id: 'pt2', name: 'Tractor', customFields: [{ id: 'cf2', label: 'Vehicle Number', type: 'text', required: true }] }
];

const INITIAL_SERVICES: PartnerService[] = [
  { id: 'ps1', category: 'Agritech', serviceName: '10L Drone Spraying', prebookingCharge: 500 },
  { id: 'ps2', category: 'Agritech', serviceName: 'Tractor Plowing' }
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

  useEffect(() => {
    localStorage.setItem('assure_partnerTypes', JSON.stringify(partnerTypes));
  }, [partnerTypes]);

  useEffect(() => {
    localStorage.setItem('assure_partnerServices', JSON.stringify(partnerServices));
  }, [partnerServices]);

  useEffect(() => {
    localStorage.setItem('assure_partners', JSON.stringify(partners));
  }, [partners]);

  return (
    <PartnerContext.Provider value={{ partnerTypes, setPartnerTypes, partnerServices, setPartnerServices, partners, setPartners }}>
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
