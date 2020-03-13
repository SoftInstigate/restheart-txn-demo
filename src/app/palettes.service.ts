import { Injectable } from '@angular/core';
import { ObjecId, Palette, Color } from 'src/app/model';
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

  loadColors(palette: ObjecId): Observable<Color[]> {
    const colors: Color[] = [
      new Color(new ObjecId('1'), 'green', '#66bb6a'),
      new Color(new ObjecId('2'), 'blu', '#2196f3'),
      new Color(new ObjecId('3'), 'lime', '#d4e157'),
      new Color(new ObjecId('4'), 'red', '#b71c1c'),
      new Color(new ObjecId('5'), 'pink', '#2196f3')
    ];

    return of(this.shuffle(colors));
  }

  private shuffle(array: Color[]): Color[] {
    let currentIndex = array.length;
    let temporaryValue;
    let randomIndex;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {

      // Pick a remaining element...
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;

      // And swap it with the current element.
      temporaryValue = array[currentIndex];
      array[currentIndex] = array[randomIndex];
      array[randomIndex] = temporaryValue;
    }

    return array;
  }
}
