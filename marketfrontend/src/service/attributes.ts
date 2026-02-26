import { mockGet } from '@/lib/http';
import { Attribute, AttributeValue } from '@/types/index';

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

// --- MOCK DATA ---
const BASE_ATTRIBUTES: Attribute[] = [
  {
    id: 'attr1',
    attributeCode: 'AT-0001',
    name: 'Brand',
    option: 'DROPDOWN',
    published: true,
    valuesCount: 5,
    createdAt: '2023-09-10T08:00:00Z',
  },
  {
    id: 'attr2',
    attributeCode: 'AT-0002',
    name: 'Color',
    option: 'RADIO',
    published: true,
    valuesCount: 8,
    createdAt: '2023-09-15T09:30:00Z',
  },
  {
    id: 'attr3',
    attributeCode: 'AT-0003',
    name: 'Size',
    option: 'DROPDOWN',
    published: false,
    valuesCount: 6,
    createdAt: '2023-09-20T10:15:00Z',
  },
  {
    id: 'attr4',
    attributeCode: 'AT-0004',
    name: 'Weight',
    option: 'DROPDOWN',
    published: true,
    valuesCount: 3,
    unitId: 'U-0001', // Linked to Kilogram (kg)
    createdAt: '2023-10-05T14:00:00Z',
  }
];

// Duplicate attributes to 60
const MOCK_ATTRIBUTES: Attribute[] = Array.from({ length: 60 }, (_, i) => {
  const base = BASE_ATTRIBUTES[i % BASE_ATTRIBUTES.length];
  return {
    ...base,
    id: `${base.id}_${i}`,
    attributeCode: `AT-${String(1000 + i)}`,
    name: `${base.name} ${i + 1}`,
  };
});

const MOCK_VALUES: AttributeValue[] = [
  // Brand Values
  { id: 'v1', attributeId: 'attr1', value: 'Nike', displayOrder: 1, createdAt: '2023-09-10T08:00:00Z' },
  { id: 'v2', attributeId: 'attr1', value: 'Adidas', displayOrder: 2, createdAt: '2023-09-10T08:00:00Z' },
  { id: 'v3', attributeId: 'attr1', value: 'Puma', displayOrder: 3, createdAt: '2023-09-10T08:00:00Z' },
  { id: 'v4', attributeId: 'attr1', value: 'Dyson', displayOrder: 4, createdAt: '2023-09-11T08:00:00Z' },
  { id: 'v5', attributeId: 'attr1', value: 'GoPro', displayOrder: 5, createdAt: '2023-09-11T08:00:00Z' },
  // Color Values
  { id: 'v6', attributeId: 'attr2', value: 'Red', displayOrder: 1, createdAt: '2023-09-15T09:30:00Z' },
  { id: 'v7', attributeId: 'attr2', value: 'Blue', displayOrder: 2, createdAt: '2023-09-15T09:30:00Z' },
  // Weight Values
  { id: 'v8', attributeId: 'attr4', value: '1', displayOrder: 1, createdAt: '2023-10-05T14:00:00Z' },
  { id: 'v9', attributeId: 'attr4', value: '2', displayOrder: 2, createdAt: '2023-10-05T14:00:00Z' },
  { id: 'v10', attributeId: 'attr4', value: '5', displayOrder: 3, createdAt: '2023-10-05T14:00:00Z' },
];

// --- HELPER ---
export const generateAttributeCode = (index: number): string => {
  return `AT-${String(index).padStart(4, '0')}`;
};

// --- ATTRIBUTE API ---

export const getAttributes = async (): Promise<Attribute[]> => {
  return await mockGet('/admin/attributes', MOCK_ATTRIBUTES.map(attr => ({
    ...attr,
    valuesCount: MOCK_VALUES.filter(v => v.attributeId === attr.id).length
  })));
};

export const getAttributeById = async (id: string): Promise<Attribute | undefined> => {
  await delay(600);
  const attr = MOCK_ATTRIBUTES.find(a => a.id === id);
  if (attr) {
    return {
      ...attr,
      valuesCount: MOCK_VALUES.filter(v => v.attributeId === attr.id).length
    };
  }
  return undefined;
};

export const createAttribute = async (data: Omit<Attribute, 'id' | 'attributeCode' | 'valuesCount' | 'createdAt'>): Promise<Attribute> => {
  await delay(800);
  const nextIndex = MOCK_ATTRIBUTES.length + 1;
  const newAttr: Attribute = {
    ...data,
    id: `attr${Date.now()}`,
    attributeCode: generateAttributeCode(nextIndex),
    valuesCount: 0,
    createdAt: new Date().toISOString(),
  };
  MOCK_ATTRIBUTES.unshift(newAttr);
  return newAttr;
};

export const updateAttribute = async (id: string, data: Partial<Attribute>): Promise<Attribute> => {
  await delay(800);
  const index = MOCK_ATTRIBUTES.findIndex(a => a.id === id);
  if (index !== -1) {
    MOCK_ATTRIBUTES[index] = { ...MOCK_ATTRIBUTES[index], ...data };
    return MOCK_ATTRIBUTES[index];
  }
  throw new Error('Attribute not found');
};

export const deleteAttribute = async (id: string): Promise<boolean> => {
  await delay(800);
  const index = MOCK_ATTRIBUTES.findIndex(a => a.id === id);
  if (index !== -1) {
    MOCK_ATTRIBUTES.splice(index, 1);
    const valuesToDelete = MOCK_VALUES.filter(v => v.attributeId === id);
    valuesToDelete.forEach(v => {
        const vIndex = MOCK_VALUES.indexOf(v);
        if(vIndex > -1) MOCK_VALUES.splice(vIndex, 1);
    });
    return true;
  }
  return false;
};

// --- ATTRIBUTE VALUES API ---

export const getAttributeValues = async (attributeId: string): Promise<AttributeValue[]> => {
  await delay(500);
  return MOCK_VALUES.filter(v => v.attributeId === attributeId).sort((a, b) => a.displayOrder - b.displayOrder);
};

export const createAttributeValue = async (data: Omit<AttributeValue, 'id' | 'createdAt'>): Promise<AttributeValue> => {
  await delay(600);
  const newValue: AttributeValue = {
    ...data,
    id: `v${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
  MOCK_VALUES.push(newValue);
  return newValue;
};

export const updateAttributeValue = async (id: string, data: Partial<AttributeValue>): Promise<AttributeValue> => {
  await delay(600);
  const index = MOCK_VALUES.findIndex(v => v.id === id);
  if (index !== -1) {
    MOCK_VALUES[index] = { ...MOCK_VALUES[index], ...data };
    return MOCK_VALUES[index];
  }
  throw new Error('Value not found');
};

export const deleteAttributeValue = async (id: string): Promise<boolean> => {
  await delay(600);
  const index = MOCK_VALUES.findIndex(v => v.id === id);
  if (index !== -1) {
    MOCK_VALUES.splice(index, 1);
    return true;
  }
  return false;
};
