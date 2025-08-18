import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { Calendar } from './calendar.model';
import {
  HttpClient,
  HttpHeaders,
  HttpErrorResponse,
} from '@angular/common/http';
import { catchError, map } from 'rxjs/operators';
import { EventInput } from '@fullcalendar/core';

@Injectable({
  providedIn: 'root',
})
export class CalendarService {
  private readonly API_URL = 'assets/data/calendar.json'; // Your API endpoint
  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
    }),
  };

  dataChange: BehaviorSubject<Calendar[]> = new BehaviorSubject<Calendar[]>([]);
  dialogData!: Calendar;

  constructor(private httpClient: HttpClient) {}

  get data(): Calendar[] {
    return this.dataChange.value;
  }

  getDialogData(): Calendar {
    return this.dialogData;
  }

  /** CRUD Methods */

  /** GET: Fetch all events */
  async loadEvents(): Promise<EventInput[]> {
    const response = await fetch(this.API_URL);
    const events = await response.json();

    return events.map((event: any) => ({
      id: event.id,
      title: event.title,
      start: new Date(`${event.start}`), // Combine date and time
      end: new Date(`${event.end}`), // Combine date and time
      className: event.className,
      groupId: event.groupId,
      details: event.details,
      allDay: event.allDay || false, // Default to false if not provided
    }));
  }

  /** POST: Add a new calendar event */
  addCalendar(calendar: Calendar): Observable<Calendar> {
    return this.httpClient
      .post<Calendar>(this.API_URL, calendar, this.httpOptions)
      .pipe(
        map((response) => {
          // Handle API response if necessary
          return calendar; // Returning the same object since we are simulating the save
        }),
        catchError(this.errorHandler)
      );
  }

  /** PUT: Update an existing calendar event */
  updateCalendar(calendar: Calendar): Observable<Calendar> {
    return this.httpClient
      .put<Calendar>(`${this.API_URL}`, calendar, this.httpOptions)
      .pipe(
        map((response) => {
          // Handle API response if necessary
          return calendar; // Return the updated calendar
        }),
        catchError(this.errorHandler)
      );
  }

  /** DELETE: Remove a calendar event by ID */
  deleteCalendar(calendar: Calendar): Observable<Calendar> {
    return this.httpClient
      .delete<void>(`${this.API_URL}`, this.httpOptions)
      .pipe(
        map(() => {
          // Return the calendar ID for deleting
          return calendar;
        }),
        catchError(this.errorHandler)
      );
  }

  /** Error Handler */
  private errorHandler(error: HttpErrorResponse): Observable<never> {
    let errorMessage = '';
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}
