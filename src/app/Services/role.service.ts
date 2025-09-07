import {EnvironmentInjector, Injectable, runInInjectionContext} from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';
import {map} from "rxjs/operators";
import {Permission} from "../interfaces/products.interface";
export interface Roles {
  id?:string;
  roleName: string;
  createdBy: string;
  createdAt: string;
  updatedBy: string;
  updatedAt: string;
  permissions: Permission[];
}

@Injectable({
  providedIn: 'root'
})
export class RoleService {
  constructor(private firestore: AngularFirestore,
              private injector : EnvironmentInjector) {}
  private collectionName = 'roles';

  // Fetch all roles with pagination
  getRoles(startAfter?: any): Observable<any> {
    return this.firestore
      .collection(this.collectionName, (ref) => {
        let query = ref.orderBy('createdAt','desc');
        if (startAfter) query = query.startAfter(startAfter);
        return query;
      })
      .snapshotChanges()
      .pipe(map((actions) => actions.map((a) => {
        const data = a.payload.doc.data();
        const id = a.payload.doc.id;
        return { id, ...(data as Roles) };
      })));
  }


  // delete Role.
  deleteRole(id: string) {
    return this.firestore.doc(`${this.collectionName}/${id}`).delete();
  }

  checkDuplicateRoleName(roleName: string): Observable<boolean> {
    return runInInjectionContext(this.injector, () => {
      return this.firestore.collection(this.collectionName, ref => ref.where('roleName', '==', roleName))
        .get()
        .pipe(
          map(snapshot => !snapshot.empty) // true if duplicate exists
        );
    });
}
  getRoleById(roleId: string): Observable<Roles | undefined> {
    return this.firestore.collection(this.collectionName).doc(roleId).valueChanges() as Observable<Roles>;
  }


  // fetch roles list
  getRoleList(): Observable<any[]> {
    return this.firestore.collection(`${this.collectionName}`, ref => ref.orderBy('createdAt', 'asc')).valueChanges({idField: 'id'});
  }
}
