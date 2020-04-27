import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { ObjectId, Palette, Color } from 'src/app/model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PalettesService {
  private BASE_URL = 'http://127.0.0.1:8080';

  constructor(private http: HttpClient) { }

  loadPalettes(): Observable<Palette[]> {
    return this.http.get<Palette[]>(this.BASE_URL.concat('/palettes?sort={"name":1}'));
  }

  loadColors(pid: ObjectId): Observable<Color[]> {
    return this.http.get<Color[]>(this.BASE_URL.concat(`/colors?filter={"palette": {"$oid": "${pid.$oid}" }}`));
  }

  get(uri: string): Observable<any> {
    return this.http.get(this.BASE_URL.concat(uri));
  }

  post(uri: string, data: any): Observable<HttpResponse<any>> {
    return this.http.post(this.BASE_URL.concat(uri), data, { observe: 'response' });
  }

  patch(uri: string, data: any): Observable<any> {
    return this.http.patch(this.BASE_URL.concat(uri), data);
  }

  delete(uri: string): Observable<any> {
    return this.http.delete(this.BASE_URL.concat(uri));
  }
}
