import {EnvironmentInjector, Injectable, isDevMode, runInInjectionContext} from '@angular/core';
import {AngularFirestore} from "@angular/fire/compat/firestore";
import {combineLatest, Observable, of, switchMap} from "rxjs";
import {map} from "rxjs/operators";
import firebase from "firebase/compat/app";
import {UserDataModel} from "./add-user/UserData.model";
import {UserService} from "./add-user/user.service";
import {environment} from "../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class StockReportService {
  env = isDevMode() ? environment.testCollections : environment.collections;
  userData: any;
  filterUser: any;
  users: any[] = [];

  constructor(
    private firestore: AngularFirestore,
    private userService: UserService,
    private injector: EnvironmentInjector
  ) {}

  // 📌 Get all Stock Reports (with optional date filtering)
  getStockReportList(startDate?: string, endDate?: string, startAfter?: any): Observable<any[]> {
    this.userData = JSON.parse(localStorage.getItem('userData')!) as any;

    return this.userService.getUsers().pipe(
      map((snapshotChanges: any[]) =>
        snapshotChanges.map(snapshot => snapshot.payload.toJSON() as any)
      ),
      map(users => {
        this.users = users;
        this.filterUser = this.users.find(u => u.email === this.userData.email);
        console.log('filterUser:', this.filterUser);
        return this.filterUser;
      }),
      switchMap(filterUser => {
        if (!filterUser?.allowedCountries) {
          console.warn('No allowed countries found for this user');
          return of([]);
        }

        let allowedCountries: string[] = [];
        if (Array.isArray(filterUser.allowedCountries)) {
          allowedCountries = filterUser.allowedCountries;
        } else if (typeof filterUser.allowedCountries === 'object') {
          allowedCountries = Object.values(filterUser.allowedCountries);
        }

        if (!allowedCountries.length) {
          console.warn('allowedCountries is empty after conversion');
          return of([]);
        }

        const chunks = this.chunkArray(allowedCountries, 10);

        const queries = chunks.map(chunk =>
          runInInjectionContext(this.injector, () =>
            this.firestore
              .collection(this.env.stockReport, ref => {
                let query: firebase.firestore.Query = ref;

                // Add date range filters
                if (startDate) {
                  query = query.where('date', '>=', startDate);
                }
                if (endDate) {
                  query = query.where('date', '<=', endDate);
                }

                if (startAfter) query = query.startAfter(startAfter);

                return query.orderBy('date', 'desc');
              })
              .snapshotChanges()
              .pipe(
                map(actions =>
                  actions.map(a => {
                    const data: any = a.payload.doc.data();
                    const docId = a.payload.doc.id;
                    return { docId, ...(data as any) };
                  })
                )
              )
          )
        );

        return combineLatest(queries).pipe(map(res => res.flat()));
      })
    );
  }

  private chunkArray<T>(arr: T[], size: number): T[][] {
    return Array.from({ length: Math.ceil(arr?.length / size) }, (_, i) =>
      arr.slice(i * size, i * size + size)
    );
  }

  // 📌 Get Stock Report by ID
  getStockReportById(id: string): Observable<any> {
    return this.firestore
      .collection(this.env.stockReport)
      .doc(id)
      .snapshotChanges()
      .pipe(
        map((action) => {
          const data = action.payload.data();
          return { id, ...(data as any) };
        })
      );
  }

  // 📌 Get Stock Report by Outlet and Date
  getStockReportByOutletAndDate(outlet: string, date: string): Observable<any> {
    const docId = `${outlet.replace(/\s+/g, '_')}_${date}`;
    return this.getStockReportById(docId);
  }

  // 📌 Get Stock Reports for specific outlet
  getStockReportsByOutlet(outlet: string, startDate?: string, endDate?: string): Observable<any[]> {
    return runInInjectionContext(this.injector, () =>
      this.firestore
        .collection(this.env.stockReport, ref => {
          let query: firebase.firestore.Query = ref.where('outlet', '==', outlet);

          if (startDate) {
            query = query.where('date', '>=', startDate);
          }
          if (endDate) {
            query = query.where('date', '<=', endDate);
          }

          return query.orderBy('date', 'desc');
        })
        .snapshotChanges()
        .pipe(
          map(actions =>
            actions.map(a => {
              const data: any = a.payload.doc.data();
              const docId = a.payload.doc.id;
              return { docId, ...(data as any) };
            })
          )
        )
    );
  }

  // 📌 Add/Update Stock Report (used by auto-save)
  saveStockReport(reportData: any): Promise<any> {
    const docId = `${reportData.outlet.replace(/\s+/g, '_')}_${reportData.date}`;

    const payload = {
      ...reportData,
      timestamp: new Date().getTime(),
      createdAt: new Date()
    };

    return this.firestore
      .collection(this.env.stockReport)
      .doc(docId)
      .set(payload, { merge: true })
      .then((result) => {
        console.log('✅ Stock Report saved successfully:', docId);
        return result;
      })
      .catch((error) => {
        console.error('❌ Error saving Stock Report:', error);
        throw error;
      });
  }

  // 📌 Batch save multiple reports (used by auto-save at 11:59 PM)
  async batchSaveStockReports(allReports: any[]): Promise<boolean> {
    const batch = this.firestore.firestore.batch();
    let successCount = 0;

    for (const report of allReports) {
      try {
        const docId = `${report.outlet.replace(/\s+/g, '_')}_${report.date}`;
        const docRef = this.firestore.collection(this.env.stockReport).doc(docId).ref;

        const firestoreData = {
          outlet: report.outlet,
          date: report.date,
          timestamp: new Date().getTime(),
          createdAt: new Date(),
          rows: report.rows.map((row: any) => ({
            product: row.product,
            sku: row.sku,
            brand: row.brand || '',
            model: row.model || '',
            variant: row.variant || '',
            opening: row.opening || 0,
            sales: row.sales || 0,
            grn: row.grn || 0,
            outgoing: row.outgoing || 0,
            incoming: row.incoming || 0,
            total: row.total || 0
          }))
        };

        batch.set(docRef, firestoreData, { merge: true });
        successCount++;
      } catch (error) {
        console.error(`❌ Error preparing batch save for ${report.outlet}:`, error);
      }
    }

    try {
      await batch.commit();
      console.log(`✅ Batch saved ${successCount} stock reports to Firestore!`);
      return true;
    } catch (error) {
      console.error('❌ Error committing batch:', error);
      return false;
    }
  }

  // 📌 Delete Stock Report
  deleteStockReport(id: string): Promise<void> {
    return this.firestore.doc(`${this.env.stockReport}/${id}`).delete();
  }

  // 📌 Get Stock Reports for date range
  getStockReportsForDateRange(startDate: string, endDate: string): Observable<any[]> {
    return runInInjectionContext(this.injector, () =>
      this.firestore
        .collection(this.env.stockReport, ref =>
          ref
            .where('date', '>=', startDate)
            .where('date', '<=', endDate)
            .orderBy('date', 'desc')
        )
        .snapshotChanges()
        .pipe(
          map(actions =>
            actions.map(a => {
              const data: any = a.payload.doc.data();
              const docId = a.payload.doc.id;
              return { docId, ...(data as any) };
            })
          )
        )
    );
  }

  // 📌 Get latest stock report for an outlet
  getLatestStockReportForOutlet(outlet: string): Observable<any> {
    return runInInjectionContext(this.injector, () =>
      this.firestore
        .collection(this.env.stockReport, ref =>
          ref
            .where('outlet', '==', outlet)
            .orderBy('date', 'desc')
            .limit(1)
        )
        .snapshotChanges()
        .pipe(
          map(actions => {
            if (actions.length > 0) {
              const data: any = actions[0].payload.doc.data();
              const docId = actions[0].payload.doc.id;
              return { docId, ...(data as any) };
            }
            return null;
          })
        )
    );
  }

  getStockList(startAfter?: any): Observable<any> {
    return this.firestore
      .collection(this.env.stockReport, (ref) => {
        let query = ref.orderBy('createdAt','desc');
        if (startAfter) query = query.startAfter(startAfter);
        return query;
      })
      .snapshotChanges()
      .pipe(map((actions) => actions.map((a) => {
        const data = a.payload.doc.data();
        const id = a.payload.doc.id;
        return { id, ...(data as any) };
      })));
  }

}
