
import { mockGet } from '../lib/http';
import { Unit } from '@/types/index';

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

const BASE_UNITS: Unit[] = [
  { id: 'U-0001', label: 'Kilogram', symbol: 'kg', type: 'WEIGHT', status: 'ACTIVE', createdAt: '2023-09-10T08:00:00Z' },
  { id: 'U-0002', label: 'Gram', symbol: 'g', type: 'WEIGHT', status: 'ACTIVE', createdAt: '2023-09-15T09:30:00Z' },
  { id: 'U-0003', label: 'Box', symbol: 'box', type: 'QUANTITY', status: 'INACTIVE', createdAt: '2023-09-20T10:00:00Z' },
  { id: 'U-0004', label: 'Liter', symbol: 'l', type: 'VOLUME', status: 'ACTIVE', createdAt: '2023-10-01T14:00:00Z' },
  { id: 'U-0005', label: 'Meter', symbol: 'm', type: 'LENGTH', status: 'ACTIVE', createdAt: '2023-10-05T11:20:00Z' },
  { id: 'U-0006', label: 'Pieces', symbol: 'pcs', type: 'QUANTITY', status: 'ACTIVE', createdAt: '2023-10-10T16:45:00Z' },
  { id: 'U-0007', label: 'Milliliter', symbol: 'ml', type: 'VOLUME', status: 'ACTIVE', createdAt: '2023-10-12T09:00:00Z' },
];

const MOCK_UNITS: Unit[] = Array.from({ length: 50 }, (_, i) => {
  const base = BASE_UNITS[i % BASE_UNITS.length];
  return {
    ...base,
    id: `${base.id}_${i}`,
    label: `${base.label} ${i + 1}`,
  };
});

export const getUnits = async (): Promise<Unit[]> => {
  return await mockGet('/admin/units', MOCK_UNITS);
};

export const getUnitById = async (id: string): Promise<Unit | undefined> => {
  await delay(500);
  return MOCK_UNITS.find(u => u.id === id);
};

export const createUnit = async (data: Omit<Unit, 'id' | 'createdAt'>): Promise<Unit> => {
  await delay(800);
  const nextId = MOCK_UNITS.length + 1;
  const newUnit: Unit = {
    ...data,
    id: `U-${String(nextId).padStart(4, '0')}`,
    createdAt: new Date().toISOString(),
  };
  MOCK_UNITS.unshift(newUnit);
  return newUnit;
};

export const updateUnit = async (id: string, data: Partial<Unit>): Promise<Unit> => {
  await delay(800);
  const index = MOCK_UNITS.findIndex(u => u.id === id);
  if (index !== -1) {
    MOCK_UNITS[index] = { ...MOCK_UNITS[index], ...data };
    return MOCK_UNITS[index];
  }
  throw new Error('Unit not found');
};

export const deleteUnit = async (id: string): Promise<boolean> => {
  await delay(800);
  const index = MOCK_UNITS.findIndex(u => u.id === id);
  if (index !== -1) {
    MOCK_UNITS.splice(index, 1);
    return true;
  }
  return false;
};
