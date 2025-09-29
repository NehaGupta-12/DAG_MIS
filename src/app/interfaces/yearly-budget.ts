export interface YearlyBudget {
  country: string;
  createdAt: Date | string;
  month: string;
  period: {
    start: Date | string;
    end: Date | string;
  };
  products: ProductTarget[];
  status: string;
  updatedAt: number;
  updatedBy: string;
  year: string;
}

export interface ProductTarget {
  model: string;
  targetQuantity: number;
}
