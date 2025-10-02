
export const environmentProduction = {
  production: true,
  mode: 'prod',
  firebaseConfig : {
    apiKey: "AIzaSyApibewYFhNYYvxl0xqr8jsGW4bi75LiFU",
    authDomain: "dag-new.firebaseapp.com",
    databaseURL: "https://dag-new-default-rtdb.firebaseio.com",
    projectId: "dag-new",
    storageBucket: "dag-new.firebasestorage.app",
    messagingSenderId: "808094841189",
    appId: "1:808094841189:web:bf4f03edb567a4be6fc98c",
    measurementId: "G-XY17JZZ6ST"
  },
    collections: {
      dealers: 'dealer',
      products: 'product',
      budget: 'budget',
      dailySales: 'daily-sales',
      stockTransfer: 'stockTransfer',
      roles: 'roles',
      outletProduct: 'outletProduct',
      monthlyBudget: 'monthlyBudget',
      menuList: 'menuList',
      inventory: 'inventory',
      grn: 'grn',
    }

};
