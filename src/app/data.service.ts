import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private baseUrl="http://localhost:3000";

  constructor(private http: HttpClient) { }

  postData(data:any){
    return this.http.post(`${this.baseUrl}/data`,data);
  }
  deleteData(id:number){
    return this.http.delete<any>(`${this.baseUrl}/data/${id}`);
  }
}
