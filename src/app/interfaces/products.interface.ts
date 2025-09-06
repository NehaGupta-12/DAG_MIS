export interface Product {
  area_of_application: string;
  avgCoverage: number;
  category: string;
  dilution: number;
  item_name: string;
  no_of_coats: number;
  productTax: boolean;
  product_name: string;
  rate: number;
  sku: number;
  sub_category: string;
  tax_rate: number;
  unit: string;
}
export interface Permission {
  id?: string;
  menuName: string;
  all?: boolean;
  list?: boolean;
  create?: boolean;
  edit?: boolean;
  delete?: boolean;
  print?: boolean;
  export?: boolean;
  approved?: boolean;
  disapproved?: boolean;
}
