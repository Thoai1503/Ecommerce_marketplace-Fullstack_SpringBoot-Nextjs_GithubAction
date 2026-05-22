import http from "@/lib/http";
import { Customer, CustomerStatus, Order } from "@/types/index";
import { AddressResponse, getAddressesByUserId } from "@/service/addresses";
import { mapOrder } from "@/service/orders";

type BackendCustomer = Record<string, any>;

const CUSTOMER_STATUSES: CustomerStatus[] = ["ACTIVE", "BANNED", "INACTIVE"];

const firstValue = <T>(...values: T[]) =>
  values.find((value) => value !== undefined && value !== null && value !== "");

const toNumber = (value: any, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const normalizeStatus = (raw: BackendCustomer): CustomerStatus => {
  const explicitStatus = String(
    firstValue(raw.status, raw.customerStatus, ""),
  ).toUpperCase();

  if (CUSTOMER_STATUSES.includes(explicitStatus as CustomerStatus)) {
    return explicitStatus as CustomerStatus;
  }

  const isActive = firstValue(raw.isActive, raw.is_active);

  if (isActive === 0 || isActive === "0" || isActive === false) {
    return "BANNED";
  }

  if (isActive === undefined || isActive === null) {
    return "INACTIVE";
  }

  return "ACTIVE";
};

const buildAvatarUrl = (raw: BackendCustomer, displayName: string) => {
  const avatar = firstValue(raw.avatar, raw.avatarUrl, raw.avatar_url);

  if (avatar) {
    return String(avatar);
  }

  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(displayName)}`;
};

const mapAddress = (address: AddressResponse | any) => {
  const id = firstValue(address.addressId, address.address_id, address.id, "");
  const addressLine = firstValue(
    address.addressLine,
    address.address_line,
    address.fullAddress,
    "",
  );
  const city = firstValue(address.city, address.cityName, address.city_name, "");
  const isDefault = firstValue(address.isDefault, address.is_default, 0);

  return {
    id: String(id),
    fullAddress: String(addressLine),
    city: String(city),
    isDefault: toNumber(isDefault) === 1 || isDefault === true,
  };
};

const mapBackendCustomer = (
  raw: BackendCustomer,
  stats: BackendCustomer = {},
): Customer => {
  const id = String(firstValue(raw.id, raw.userId, raw.user_id, ""));
  const fullName = String(
    firstValue(raw.fullName, raw.full_name, raw.name, raw.username, "Khách hàng"),
  );
  const totalOrders = toNumber(
    firstValue(stats.totalOrders, raw.totalOrders, raw.total_orders),
  );
  const totalSpent = toNumber(
    firstValue(stats.totalSpent, raw.totalSpent, raw.total_spent),
  );
  const lastOrderDate = firstValue(
    stats.lastOrderDate,
    raw.lastOrderDate,
    raw.last_order_date,
  );

  return {
    id,
    accountCode: `AC-${id.padStart(4, "0")}`,
    fullName,
    email: String(firstValue(raw.email, "")),
    phone: String(firstValue(raw.phone, "")),
    avatar: buildAvatarUrl(raw, fullName),
    totalOrders,
    totalSpent,
    lastOrderDate: lastOrderDate ? String(lastOrderDate) : undefined,
    status: normalizeStatus(raw),
    joinedAt: String(
      firstValue(raw.createdAt, raw.created_at, new Date().toISOString()),
    ),
    addresses: Array.isArray(raw.addresses) ? raw.addresses.map(mapAddress) : [],
    note: raw.note,
  };
};

const extractRows = (payload: any): BackendCustomer[] => {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (Array.isArray(payload?.data)) {
    return payload.data;
  }

  if (Array.isArray(payload?.customers)) {
    return payload.customers;
  }

  return [];
};

export const getCustomers = async (): Promise<Customer[]> => {
  const response = await http.get("/customers");
  return extractRows(response.data).map((customer) =>
    mapBackendCustomer(customer),
  );
};

export const getCustomerById = async (
  id: string,
): Promise<Customer | undefined> => {
  const response = await http.get(`/customers/${id}`);
  const payload = response.data;
  const rawCustomer = payload?.customer ?? payload;

  if (!rawCustomer) {
    return undefined;
  }

  const customer = mapBackendCustomer(rawCustomer, payload ?? {});
  const numericId = Number(id);

  if (Number.isFinite(numericId)) {
    try {
      const addresses = await getAddressesByUserId(numericId);
      customer.addresses = addresses.map(mapAddress);
    } catch (error) {
      console.warn(`Failed to fetch customer addresses for ${id}:`, error);
    }
  }

  return customer;
};

export const getCustomerOrders = async (customerId: string): Promise<Order[]> => {
  const numericId = Number(customerId);

  if (!Number.isFinite(numericId)) {
    return [];
  }

  const response = await http.get("/api/orders", {
    params: {
      userId: numericId,
      page: 1,
      size: 50,
      sortOrder: "desc",
    },
  });
  const rows = extractRows(response.data?.orders ?? response.data);

  return rows.map(mapOrder);
};

export const updateCustomer = async (
  id: string,
  data: Partial<Customer>,
): Promise<Customer> => {
  const payload: BackendCustomer = {};

  if (data.fullName !== undefined) payload.fullName = data.fullName;
  if (data.email !== undefined) payload.email = data.email;
  if (data.phone !== undefined) payload.phone = data.phone;
  if (data.avatar !== undefined) payload.avatarUrl = data.avatar;

  if (Object.keys(payload).length > 0) {
    await http.put(`/customers/${id}`, payload);
  }

  if (data.status !== undefined) {
    await toggleBlockStatus(id, data.status === "BANNED");
  }

  if (data.note !== undefined) {
    await http.patch(`/customers/${id}/note`, { note: data.note });
  }

  const updated = await getCustomerById(id);

  if (!updated) {
    throw new Error("Customer not found");
  }

  return updated;
};

export const deleteCustomers = async (ids: string[]): Promise<boolean> => {
  await Promise.all(ids.map((id) => http.delete(`/customers/${id}`)));
  return true;
};

export const toggleBlockStatus = async (
  id: string,
  isBlocked: boolean,
): Promise<boolean> => {
  await http.patch(`/customers/${id}/status`, {
    isActive: isBlocked ? 0 : 1,
  });

  return true;
};
