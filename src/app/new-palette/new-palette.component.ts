import { Component, OnInit } from '@angular/core';
import { Observable, of, interval, Subscription } from 'rxjs';
import { delay, map, mergeMap } from 'rxjs/operators';
import { Color, Palette, ObjectId } from 'src/app/model';
import { PalettesService } from 'src/app/palettes.service';

@Component({
  selector: 'app-new-palette',
  templateUrl: './new-palette.component.html',
  styleUrls: ['./new-palette.component.css']
})
export class NewPaletteComponent implements OnInit {
  log = '';
  created = false;
  errored = false;

  sid: string = null;
  txn: string = null;
  pid: ObjectId = null;
  startCreatingPalette = false;
  paletteCreated = false;
  startCreatingColors = false;
  colorsCreated = false;

  docsCreated = false;

  txnAge = 0;
  timer: Subscription;

  constructor(private palettesService: PalettesService) { }

  ngOnInit(): void {
  }

  appendLog(msg: string): void {
    this.log += msg += '\n';
  }

  cleartTreminal() {
    this.log = '';
  }

  /**
   * @returns the id of the created session
   */
  createSession(): void {
    console.log(`createSession()`);

    of('> POST /_sessions')
      .pipe(
        map(str => { console.log('msg', str); this.appendLog(`${str}`); return null; }),

        // Here execute the request
        mergeMap(() => this.palettesService.post('/_sessions', null)
          .pipe(
            map(resp => {
              const loc = resp.headers.get('Location');
              return loc.substring(loc.lastIndexOf('/') + 1);
            }),
            //delay(500),
            map(sid => { this.appendLog(`HTTP/1.1 201 Created\nLocation: /_sessions/${sid}\n`); return sid; }))
        )
      )
      .subscribe(sid => this.sid = sid);
  }

  /**
   * @param sid the session id
   * @returns the id of the started txn
   */
  startTxn(sid: string): void {
    console.log(`startTxn(${sid})`);

    this.timer = interval(1000)
      .pipe(map(x => this.txnAge = x))
      .subscribe();

    if (!sid) {
      return;
    }

    of(`> POST /_sessions/${sid}/_txns`)
      .pipe(
        map(str => { console.log('msg', str); this.appendLog(`${str}`); return null; }),

        // Here execute the request
        mergeMap(() => this.palettesService.post(`/_sessions/${sid}/_txns`, null)

          .pipe(
            map(resp => {
              const loc = resp.headers.get('Location');
              return loc.substring(loc.lastIndexOf('/') + 1);
            }),
            //delay(500),
            map(txn => { this.appendLog(`HTTP/1.1 201 Created\nLocation: /_sessions/${sid}/_txns/${txn}\n`); return txn; }))
        )
      )
      .subscribe(txn => this.txn = txn);
  }

  /**
   * @param sid the session id
   */
  getTxnStatus(sid: string): void {
    console.log(`getTxnStatus(${sid})`);

    if (!sid) {
      return;
    }

    of(`> GET /_sessions/${sid}/_txns`)
      .pipe(
        map(str => { console.log('msg', str); this.appendLog(`${str}`); return null; }),

        // Here execute the request
        mergeMap(() => this.palettesService.get(`/_sessions/${sid}/_txns`)

          .pipe(
            //delay(500),
            map(res => {
              this.appendLog('HTTP/1.1 200 OK\n'.concat(JSON.stringify(res, null, 2)));

              return res;
            }))
        )
      )
      .subscribe();
  }

  /**
   * @param sid the session id
   * @param txn the txn number
   */
  getData(sid: string, txn?: string): void {
    console.log(`getTxnStatus(${sid})`);

    if (!sid) {
      return;
    }

    const uriP = txn ? `/palettes?sid=${sid}&txn=${txn}` : `/palettes?sid=${sid}`;
    const uriC = txn ? `/colors?sid=${sid}&txn=${txn}` : `/colors?sid=${sid}`;

    const reqP = `> GET ${uriP}`;
    const reqC = `> GET ${uriC}`;

    of(reqP)
      .pipe(
        map(str => { console.log('msg', str); this.appendLog(`${str}`); return null; }),

        // Here execute the request
        mergeMap(() => this.palettesService.get(uriP).pipe(
          //delay(500),
          map(res => {
            this.appendLog('HTTP/1.1 200 OK\n'.concat(JSON.stringify(res, null, 2)));

            return res;
          }))
        ),
        map(() => { console.log('msg', reqC); this.appendLog(`\n${reqC}`); return null; }),
        mergeMap(() => this.palettesService.get(uriC).pipe(
          //delay(500),
          map(res => {
            this.appendLog('HTTP/1.1 200 OK\n'.concat(JSON.stringify(res, null, 2)));

            return res;
          }))
        )
      )
      .subscribe();
  }

  /**
   * @param sid the session id
   * @param txn the txn number
   * @returns true
   */
  createPalette(sid: string, txn: string): void {
    console.log(`createPalette(${sid}, ${txn})`);

    if (!sid || !txn) {
      return;
    }

    this.startCreatingPalette = true;

    const palette = { name: 'Transacted Palette!' };

    of(`> POST /palettes/?sid=${sid}&txn=${txn}\n` + JSON.stringify(palette, null, 2))
      .pipe(
        map(str => { console.log('msg', str); this.appendLog(`${str}`); return null; }),

        // Here execute the request
        mergeMap(() => this.palettesService.post(`/palettes/?sid=${sid}&txn=${txn}`, palette)
          .pipe(
            //delay(500),
            map(resp => {
              const loc = resp.headers.get('Location');
              return loc.substring(loc.lastIndexOf('/') + 1);
            }),
            map(id => { this.appendLog(`\nHTTP/1.1 201 Created\nLocation: /palettes/${id}\n`); return id; }))
        )
      )
      .subscribe(p => {
        this.pid = { $oid: p };
        this.paletteCreated = true;
      });
  }

  /**
   * @param sid the session id
   * @param txn the txn number
   * @returns true
   */
  createColors(sid: string, txn: string, pid: ObjectId): void {
    this.startCreatingColors = true;

    const colors = this.shuffle([
      { name: 'green', hex: '#66bb6a' },
      { name: 'pink',  hex: '#2196f3' },
      { name: 'blu',   hex: '#2196f3' },
      { name: 'lime',  hex: '#d4e157' },
      { name: 'red',   hex: '#b71c1c' }
    ]);

    this.createColor(sid, txn, pid, colors[0].name, colors[0].hex)
      .pipe(
        mergeMap(() => this.createColor(sid, txn, pid, colors[1].name, colors[1].hex)),
        mergeMap(() => this.createColor(sid, txn, pid, colors[2].name, colors[2].hex)),
        mergeMap(() => this.createColor(sid, txn, pid, colors[3].name, colors[3].hex)),
        mergeMap(() => this.createColor(sid, txn, pid, colors[4].name, colors[4].hex))
      ).subscribe(() => this.colorsCreated = true);
  }

  private shuffle(array: any[]): any[] {
    let currentIndex = array.length;
    let temporaryValue: number;
    let randomIndex: number;

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

  /**
   * @param sid the session id
   * @param txn the txn number
   * @returns true
   */
  private createColor(sid: string, txn: string, pid: ObjectId, name: string, hex: string): Observable<ObjectId> {
    console.log(`createColors(${sid}, ${txn}, ${pid})`);

    if (!sid || !txn || !pid) {
      return;
    }

    const color = { name: `${name}`, hex: `${hex}`, palette: { $oid: pid.$oid } };

    return of(`> POST /colors/?sid=${sid}&txn=${txn}\n` + JSON.stringify(color, null, 2))
      .pipe(
        map(str => { console.log('msg', str); this.appendLog(`${str}`); return str; }),

        // Here execute the request
        mergeMap(() => this.palettesService.post(`/colors/?sid=${sid}&txn=${txn}`, color)

          .pipe(
            //delay(500),
            map(resp => {
              const loc = resp.headers.get('Location');
              return loc.substring(loc.lastIndexOf('/') + 1);
            }),
            map(id => { this.appendLog(`\nHTTP/1.1 201 Created\nLocation: /palettes/${id}\n`); return { $oid: id }; }))
        )
      );
  }

  /**
   * @param sid the session id
   * @param txn the txn number
   * @returns true
   */
  commitTxn(sid: string, txn: string): void {
    console.log(`commitTxn(${sid}, ${txn})`);

    this.resetStatus();

    if (!sid || !txn) {
      return;
    }

    of(`> PATCH /_sessions/${sid}/_txns/${txn}`)
      .pipe(
        map(str => { console.log('msg', str); this.appendLog(`${str}`); return null; }),

        // Here execute the request
        mergeMap(() => this.palettesService.patch(`/_sessions/${sid}/_txns/${txn}`, null)

          .pipe(
            //delay(500),
            map(res => { this.appendLog(`HTTP/1.1 200 OK\n`); this.txn = null; return res; }))
        )
      )
      .subscribe();
  }

  /**
   * @param sid the session id
   * @param txn the txn number
   * @returns true
   */
  abortTxn(sid: string, txn: string): void {
    console.log(`abortTxn(${sid}, ${txn})`);

    this.resetStatus();

    if (!sid || !txn) {
      return;
    }

    of(`> DELETE /_sessions/${sid}/_txns/${txn}`)
      .pipe(
        map(str => { console.log('msg', str); this.appendLog(`${str}`); return null; }),

        // Here execute the request
        mergeMap(() => this.palettesService.delete(`/_sessions/${sid}/_txns/${txn}`)

          .pipe(
            //delay(500),
            map(res => { this.appendLog(`HTTP/1.1 204 No Content\n`); this.txn = null; return res; }))
        )
      )
      .subscribe();
  }

  /**
   * @returns true
   */
  deleteAllData(): void {
    console.log(`deleteAll()`);

    of('> DELETE /palettes/*?filter={"$oid":{"$exists":true}}')
      .pipe(
        map(str => { console.log('msg', str); this.appendLog(`${str}`); return null; }),

        // Here execute the request
        mergeMap(() => this.palettesService.delete('/palettes/*?filter={"_id":{"$exists":true}}')

          .pipe(
            //delay(500),
            map(res => {
              this.appendLog('\nHTTP/1.1 200 OK\n'.concat(JSON.stringify(res, null, 2)));

              return res;
            }))
        ),

        map(res => '\n> DELETE /colors/*?filter={"$oid":{"$exists":true}}'),

        map(str => { console.log('msg', str); this.appendLog(`${str}`); return null; }),

        // Here execute the request
        mergeMap(() => this.palettesService.delete(`/colors/*?filter={"_id":{"$exists":true}}`)

          .pipe(
            //delay(500),
            map(res => {
              this.appendLog('\nHTTP/1.1 200 OK\n'.concat(JSON.stringify(res, null, 2)));

              return res;
            }))
        )
      )
      .subscribe();
  }

  private resetStatus() {
    this.txn = null;
    this.pid = null;
    this.startCreatingColors = false;
    this.startCreatingPalette = false;
    this.paletteCreated = false;
    this.colorsCreated = false;
    this.timer.unsubscribe();
    this.txnAge = 0;
  }
}
