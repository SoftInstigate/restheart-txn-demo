import { Component, OnInit } from '@angular/core';
import { Observable, of, pipe } from 'rxjs';
import { delay, map, mergeMap, catchError } from 'rxjs/operators';
import { Color, Palette, ObjectId } from 'src/app/model';

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

  constructor() { }

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

        // Here execute the POST
        mergeMap(() => of('12313-dffs-44543-432sdf')

          .pipe(
            delay(500),
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

    if (!sid) {
      return;
    }

    of(`> POST /_sessions/${sid}/_txns`)
      .pipe(
        map(str => { console.log('msg', str); this.appendLog(`${str}`); return null; }),

        // Here execute the POST
        mergeMap(() => of('1')

          .pipe(
            delay(500),
            map(txn => { this.appendLog(`HTTP/1.1 201 Created\nLocation: /_sessions/${sid}/_txns/${txn}\n`); return txn; }))
        )
      )
      .subscribe(txn => this.txn = txn);
  }

  /**
   * @param sid the session id
   * param txn the txn number
   * @returns true
   */
  getTxnStatus(sid: string): void {
    console.log(`getTxnStatus(${sid})`);

    if (!sid) {
      return;
    }

    of(`> GET /_sessions/${sid}/_txns`)
      .pipe(
        map(str => { console.log('msg', str); this.appendLog(`${str}`); return null; }),

        // Here execute the POST
        mergeMap(() => of(true)

          .pipe(
            delay(500),
            map(res => {
              this.appendLog(`HTTP/1.1 200 OK\n
{
  "currentTxn": {
  "id": 1,
  "status": "IN"
  }
}\n`);

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

    of(`> POST /palettes/?sid=${sid}&txn=${txn}\n`)
      .pipe(
        map(str => { console.log('msg', str); this.appendLog(`${str}`); return null; }),

        // Here execute the POST
        mergeMap(() => of(new ObjectId('sdfsdfsd-sfdds-fddffd-dfsdffd'))

          .pipe(
            delay(500),
            map(res => { this.appendLog(`HTTP/1.1 201 Created\n`); return res; }))
        )
      )
      .subscribe(p => {
        this.pid = p;
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

    this.createColor(sid, txn, pid).pipe(
      mergeMap(() => this.createColor(sid, txn, pid)),
      mergeMap(() => this.createColor(sid, txn, pid)),
      mergeMap(() => this.createColor(sid, txn, pid)),
      mergeMap(() => this.createColor(sid, txn, pid))
    ).subscribe(() => this.colorsCreated = true);
  }

  /**
   * @param sid the session id
   * @param txn the txn number
   * @returns true
   */
  private createColor(sid: string, txn: string, pid: ObjectId): Observable<ObjectId> {
    console.log(`createColors(${sid}, ${txn}, ${pid})`);

    if (!sid || !txn || !pid) {
      return;
    }

    return of(`> POST /colors/?sid=${sid}&txn=${txn}\n`)
      .pipe(
        map(str => { console.log('msg', str); this.appendLog(`${str}`); return str; }),

        // Here execute the POST
        mergeMap(() => of(new ObjectId('sdfsdfsd-sfdds-fddffd-dfsdffd'))

          .pipe(
            delay(500),
            map(res => { this.appendLog(`HTTP/1.1 201 Created\n`); return res; }))
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

    this.txn = null;
    this.pid = null;
    this.startCreatingColors = false;
    this.startCreatingPalette = false;
    this.paletteCreated = false;
    this.colorsCreated = false;

    if (!sid || !txn) {
      return;
    }

    of(`> PATCH /_sessions/${sid}/_txns/${txn}`)
      .pipe(
        map(str => { console.log('msg', str); this.appendLog(`${str}`); return null; }),

        // Here execute the POST
        mergeMap(() => of(true)

          .pipe(
            delay(500),
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

    this.txn = null;
    this.pid = null;
    this.startCreatingColors = false;
    this.startCreatingPalette = false;
    this.paletteCreated = false;
    this.colorsCreated = false;

    if (!sid || !txn) {
      return;
    }

    of(`> DELETE /_sessions/${sid}/_txns/${txn}`)
      .pipe(
        map(str => { console.log('msg', str); this.appendLog(`${str}`); return null; }),

        // Here execute the POST
        mergeMap(() => of(true)

          .pipe(
            delay(500),
            map(res => { this.appendLog(`HTTP/1.1 204 No Content\n`); this.txn = null; return res; }))
        )
      )
      .subscribe();
  }

  /**
   * @param sid the session id
   * @param txn the txn id
   * @param pid the palette id
   * @param color the color to create
   * @returns the id of the created color
   */
  private writeColor(sid: string, txn: string, pid: ObjectId, color: Color): Observable<ObjectId> {
    const n = Math.floor(Math.random() * 1000);
    return of(new ObjectId(`${n}`)).pipe(delay(1000));
  }

  /**
   * @param sid the session id
   * @param txn the txn id
   * @param color the color to create
   * @returns the id of the created palette
   */
  private writePalette(sid: string, txn: string, palette: Palette): Observable<ObjectId> {
    return of(new ObjectId('12345')).pipe(delay(1000));
  }
}
