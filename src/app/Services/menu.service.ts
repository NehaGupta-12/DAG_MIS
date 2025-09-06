// menu.service.ts
import { Injectable } from '@angular/core';
import { AngularFirestore } from "@angular/fire/compat/firestore";
import {Observable, take} from "rxjs";
import { map } from "rxjs/operators";
import { Menus } from "../interfaces/menu.interface";

@Injectable({
  providedIn: 'root'
})
export class MenuService {
  private collectionName = 'menuList';

  constructor(private firestore: AngularFirestore) {}

  /**
   * Retrieves a paginated list of menus from Firestore.
   * @param startAfter The document to start after for pagination.
   * @returns An Observable of the menu list.
   */
  getMenuList(startAfter?: any): Observable<any> {
    return this.firestore.collection(this.collectionName, ref => {
      let query = ref.orderBy('createdAt', 'desc');
      if (startAfter) query = query.startAfter(startAfter);
      return query;
    })
      .snapshotChanges()
      .pipe(map(actions => actions.map(a => {
        const data = a.payload.doc.data();
        const id = a.payload.doc.id;
        return { id, ...(data as Menus) };
      })));
  }

  /**
   * Fetches all menus as a simple array of objects.
   * @returns An Observable of the menu list with document IDs.
   */
  fetchMenus(): Observable<any[]> {
    return this.firestore.collection(this.collectionName).valueChanges({ idField: 'id' });
  }

  /**
   * Adds a new menu item to the Firestore collection.
   * @param menu The menu object to add.
   * @returns A Promise that resolves when the document has been added.
   */
  addMenu(menu: Menus): Promise<any> {
    return this.firestore.collection(this.collectionName).add(menu);
  }

  /**
   * Updates an existing menu item.
   * @param id The ID of the menu document to update.
   * @param menu A partial menu object containing the fields to update.
   * @returns A Promise that resolves when the document has been updated.
   */
  updateMenu(id: string, menu: Partial<Menus>): Promise<any> {
    return this.firestore.collection(this.collectionName).doc(id).update(menu);
  }

  /**
   * Deletes a menu item by its document ID.
   * @param id The ID of the menu document to delete.
   * @returns A Promise that resolves when the document has been deleted.
   */
  deleteMenu(id: string): Promise<void> {
    return this.firestore.doc(`${this.collectionName}/${id}`).delete();
  }

  /**
   * Checks for a duplicate menu name in the Firestore collection.
   * @param menu_name The name to check for.
   * @returns An Observable that emits true if a duplicate exists, otherwise false.
   */
  checkDuplicateMenuName(menu_name: string): Observable<boolean> {
    return this.firestore.collection<Menus>(this.collectionName, ref =>
      ref.where('menu_name', '==', menu_name)
    ).valueChanges()
      .pipe(
        take(1), // complete immediately
        map(menus => menus.length > 0) // true if duplicate exists
      );
  }

}
