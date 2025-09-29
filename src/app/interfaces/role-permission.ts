export interface RolePermission {
  id?: string; // Firestore document ID (optional)
  roleName: string;
  createdAt: Date | string; // Firestore timestamp or ISO string
  createdBy: string;
  updatedAt: Date | string;
  updatedBy: string;
  permissions: MenuPermissionEntry[];
}

export interface MenuPermissionEntry {
  menuId: string;
  menuSrNo: number;
  menu_name: string;
  permissions: PermissionSet;
}

export interface PermissionSet {
  all: boolean;
  approved: boolean;
  create: boolean;
  delete: boolean;
  disapproved: boolean;
  edit: boolean;
  export: boolean;
  list: boolean;
  print: boolean;
  showMenu: boolean;
}
