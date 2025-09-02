
export interface Dealer {
  id: string;
  name: string;
  address?: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  brand: string;
  model: string;
  variant: string;
  unit: string;
  openingStock?: number;
  __isNew?: boolean; // used only on UI
}

export interface OutletProductPayload {
  dealerId: string;
  dealerOutlet: string;
  remark: string;
  createdAt: number;
  createdBy: string;
  sku: string;
  name: string;
  brand: string;
  model: string;
  variant: string;
  unit: string;
  openingStock: number;
  outletId?: string;
}

export interface UserData {
  userName: string;
  email?: string;
  role?: string;
}
