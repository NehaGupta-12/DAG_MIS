export interface StockTransfer {
  id?: string;
  createBy: string;
  createdAt: Date | string;
  fromDealerOutlet: string;
  toDealerOutlet: string;
  status: string;
  items: StockTransferItem[];
}

export interface StockTransferItem {
  model: string;
  sku: string;
  quantity: number;
  unit: string;
  [key: string]: any;
}
