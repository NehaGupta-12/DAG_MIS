// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.production.ts` with `environmentProduction.prod.ts`.
// The list of file replacements can be found in `angular.json`.
export const environment = {
  production: false,
  firebaseConfig: {
    apiKey: "AIzaSyApibewYFhNYYvxl0xqr8jsGW4bi75LiFU",
    authDomain: "dag-new.firebaseapp.com",
    projectId: "dag-new",
    storageBucket: "dag-new.firebasestorage.app",
    messagingSenderId: "808094841189",
    appId: "1:808094841189:web:bf4f03edb567a4be6fc98c",
    measurementId: "G-XY17JZZ6ST"
  },
  testCollections: {
    dealers: 'dev-dealer',
    products: 'dev-product',
    budget: 'dev-budget',
    dailySales: 'dev-daily-sales',
    stockTransfer: 'dev-stockTransfer',
    incomingStockTransfer: 'dev-incomingStockTransfer',
    roles: 'dev-roles',
    outletProduct: 'dev-outletProduct',
    monthlyBudget: 'dev-monthlyBudget',
    menuList: 'menuList',
    inventory: 'dev-inventory',
    grn: 'dev-grn',
    location: 'dev-location',
    activityLog: 'dev-activityLog',
    stockReport: 'dev-stockReport'
  },
  collections: {
    dealers: 'dealer',
    products: 'product',
    budget: 'budget',
    dailySales: 'daily-sales',
    stockTransfer: 'stockTransfer',
    incomingStockTransfer: 'incomingStockTransfer',
    roles: 'roles',
    outletProduct: 'outletProduct',
    monthlyBudget: 'monthlyBudget',
    menuList: 'menuList',
    inventory: 'inventory',
    grn: 'grn',
    location: 'location',
    activityLog: 'activityLog',
    stockReport: 'stockReport'
  }
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
