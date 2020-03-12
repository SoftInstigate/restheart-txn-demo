import { Injectable } from '@angular/core';
import { ObjecId, Palette } from 'src/app/model';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PalettesService {

  constructor() { }

  loadPalettes(): Observable<Palette[]> {
    const palettes: Palette[] = [
      new Palette(new ObjecId('1'), 'palette 1'),
      new Palette(new ObjecId('2'), 'palette 2'),
      new Palette(new ObjecId('3'), 'palette 3'),
      new Palette(new ObjecId('4'), 'palette 4'),
      new Palette(new ObjecId('5'), 'palette 5')
    ];

    return of(palettes);
  }
}
