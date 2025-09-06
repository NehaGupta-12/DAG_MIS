import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';
import {map} from "rxjs/operators";
export interface Roles {
  role_name: string;
  createdBy: string;
  createdAt: string;
  updatedBy: string;
  updatedAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class RoleService {
  constructor(private firestore: AngularFirestore) {}
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

  // check for duplicate
  checkDuplicateRoleName(roleName: string): Observable<boolean> {
    return this.firestore.collection(this.collectionName, ref => ref.where('roleName', '==', roleName))
      .get()
      .pipe(
        map(snapshot => {
          return !snapshot.empty;  // Returns true if there's a duplicate, false otherwise
        })
      );
  }

  // fetch roles list
  getRoleList(): Observable<any[]> {
    return this.firestore.collection(`${this.collectionName}`, ref => ref.orderBy('createdAt', 'asc')).valueChanges({idField: 'id'});
  }
}
