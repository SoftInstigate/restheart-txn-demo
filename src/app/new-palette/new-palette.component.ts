import { Component, OnInit, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Observable, of, timer, Subscription } from 'rxjs';
import { delay, map, mergeMap, catchError } from 'rxjs/operators';
import { ObjectId } from 'src/app/model';
import { PalettesService } from 'src/app/palettes.service';

interface Log { msg: string; color: string; }

@Component({
  selector: 'app-new-palette',
  templateUrl: './new-palette.component.html',
  styleUrls: ['./new-palette.component.css']
})
export class NewPaletteComponent implements OnInit {
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

  logs: Log[] = [];

  constructor(private palettesService: PalettesService, public dialog: MatDialog) { }

  ngOnInit(): void {
  }

  appendLog(msg: string, color: string): void {
    this.logs.push({ msg: msg.concat('\n'), color });
  }

  scroll(): void {
    const terminal = document.getElementById('terminal-content');

    of(1).pipe(
      delay(100),
      map(() => {
        terminal.scrollBy({
          top: 100000,
          behavior: 'smooth'
        });
      }))
      .subscribe();
  }

  cleartTreminal() {
    this.logs = [];
  }

  truncate(sid: string): string {
    if (sid) {
      return sid.substring(0, 8).concat('...');
    }
  }

  zoom(msg: string): void {
    const dialogRef = this.dialog.open(RequestZoomComponent, {
      width: '1400px',
      data: msg
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed', result);
    });
  }

  /**
   * @returns the id of the created session
   */
  createSession(): void {
    console.log(`createSession()`);

    of('> POST /_sessions')
      .pipe(
        map(str => { console.log('msg', str); this.appendLog(`${str}`, 'text-light bg-primary'); return null; }),

        // Here execute the request
        mergeMap(() => this.palettesService.post('/_sessions', null)
          .pipe(
            map(resp => {
              const loc = resp.headers.get('Location');
              return loc.substring(loc.lastIndexOf('/') + 1);
            }),
            // delay(500),
            map(sid => {
              this.appendLog(`HTTP/1.1 201 Created\nLocation: `
                + `/_sessions/${this.truncate(sid)}\n`, 'text-success');
              return sid;
            }),
            catchError(res => { this.appendLog(`HTTP/1.1 400 Bad Request\n`, 'text-danger'); this.resetStatus(); return []; })
          )),
        map(sid => { this.scroll(); return sid; })
      )
      .subscribe(sid => this.sid = sid);
  }

  /**
   * @param sid the session id
   * @returns the id of the started txn
   */
  startTxn(sid: string): void {
    console.log(`startTxn(${sid})`);

    this.timer = timer(1000, 1000)
      .pipe(map(x => this.txnAge = x))
      .subscribe();

    if (!sid) {
      return;
    }

    of(`> POST /_sessions/${this.truncate(sid)}/_txns`)
      .pipe(
        map(str => { console.log('msg', str); this.appendLog(`${str}`, 'text-light bg-primary'); return null; }),

        // Here execute the request
        mergeMap(() => this.palettesService.post(`/_sessions/${sid}/_txns`, null)

          .pipe(
            map(resp => {
              const loc = resp.headers.get('Location');
              return loc.substring(loc.lastIndexOf('/') + 1);
            }),
            // delay(500),
            map(txn => {
              this.appendLog(`HTTP/1.1 201 Created\nLocation: ` +
                `/_sessions/${this.truncate(sid)}/_txns/${txn}\n`, 'text-success');
              return txn;
            }),
            catchError(res => { this.appendLog(`HTTP/1.1 400 Bad Request\n`, 'text-danger'); this.resetStatus(); return []; })
          )),
        map(txn => { this.scroll(); return txn; })
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

    of(`> GET /_sessions/${this.truncate(sid)}/_txns`)
      .pipe(
        map(str => { console.log('msg', str); this.appendLog(`${str}`, 'text-light bg-primary'); return null; }),

        // Here execute the request
        mergeMap(() => this.palettesService.get(`/_sessions/${sid}/_txns`)

          .pipe(
            // delay(500),
            map(res => {
              this.appendLog('HTTP/1.1 200 OK', 'text-success');
              this.appendLog(JSON.stringify(res, null, 2).concat('\n'), 'text-white');

              return res;
            }),
            catchError(res => { this.appendLog(`HTTP/1.1 400 Bad Request\n`, 'text-danger'); this.resetStatus(); return []; })
          )),
        map(() => { this.scroll(); return null; })
      )
      .subscribe();
  }

  /**
   * @param sid the session id
   * @param txn the txn number
   */
  getData(sid?: string, txn?: string): void {
    console.log(`getData(${sid}, ${txn})`);

    const uriP = sid && txn ? `/palettes?sid=${sid}&txn=${txn}` : `/palettes`;
    const uriC = sid && txn ? `/colors?sid=${sid}&txn=${txn}` : `/colors`;

    const reqP = sid && txn ? `> GET /palettes?sid=${this.truncate(sid)}&txn=${txn}` : `> GET /palettes`;
    const reqC = sid && txn ? `> GET /colors?sid=${this.truncate(sid)}&txn=${txn}` : `> GET /colors`;

    of(reqC)
      .pipe(
        map(str => { console.log('msg', str); this.appendLog(`${str}`, 'text-light bg-primary'); return null; }),

        // Here execute the request
        mergeMap(() => this.palettesService.get(uriC).pipe(
          // delay(500),
          map(res => {
            this.appendLog('HTTP/1.1 200 OK', 'text-success');
            this.appendLog(JSON.stringify(res, null, 2).concat('\n'), 'text-white');

            return res;
          }))
        ),
        catchError(res => { this.appendLog(`HTTP/1.1 400 Bad Request`, 'text-danger'); this.resetStatus(); return []; }),
        map(() => { console.log('msg', reqP); this.appendLog(`${reqP}`, 'text-light bg-primary'); return null; }),
        mergeMap(() => this.palettesService.get(uriP).pipe(
          // delay(500),
          map(res => {
            this.appendLog('HTTP/1.1 200 OK', 'text-success');
            this.appendLog(JSON.stringify(res, null, 2).concat('\n'), 'text-white');

            return res;
          }),
          catchError(res => { this.appendLog(`HTTP/1.1 400 Bad Request`, 'text-danger'); this.resetStatus(); return []; })
        )),
        map(() => { this.scroll(); return null; })
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

    const palette = { name: `Transacted Palette ${txn}!` };

    of(`> POST /palettes/?sid=${this.truncate(sid)}&txn=${txn}\n` + JSON.stringify(palette, null, 2))
      .pipe(
        map(str => { console.log('msg', str); this.appendLog(`${str}`, 'text-light bg-primary'); return null; }),

        // Here execute the request
        mergeMap(() => this.palettesService.post(`/palettes/?sid=${sid}&txn=${txn}`, palette)
          .pipe(
            // delay(500),
            map(resp => {
              const loc = resp.headers.get('Location');
              return loc.substring(loc.lastIndexOf('/') + 1);
            }),
            map(id => { this.appendLog(`HTTP/1.1 201 Created\nLocation: /palettes/${id}\n`, 'text-success'); return id; }),
            catchError(res => { this.appendLog(`HTTP/1.1 400 Bad Request\n`, 'text-danger'); this.resetStatus(); return []; })
          )),
        map(p => { this.scroll(); return p; })
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
      { name: 'pink', hex: '#ffc2cd' },
      { name: 'blu', hex: '#2196f3' },
      { name: 'lime', hex: '#d4e157' },
      { name: 'red', hex: '#b71c1c' }
    ]);

    this.createColor(sid, txn, pid, colors[0].name, colors[0].hex)
      .pipe(
        mergeMap(() => this.createColor(sid, txn, pid, colors[1].name, colors[1].hex)),
        mergeMap(() => this.createColor(sid, txn, pid, colors[2].name, colors[2].hex)),
        mergeMap(() => this.createColor(sid, txn, pid, colors[3].name, colors[3].hex)),
        mergeMap(() => this.createColor(sid, txn, pid, colors[4].name, colors[4].hex)),
        map(() => { this.scroll(); return null; })
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

    return of(`> POST /colors/?sid=${this.truncate(sid)}&txn=${txn}\n` + JSON.stringify(color, null, 2))
      .pipe(
        map(str => { console.log('msg', str); this.appendLog(`${str}`, 'text-light bg-primary'); return str; }),

        // Here execute the request
        mergeMap(() => this.palettesService.post(`/colors/?sid=${sid}&txn=${txn}`, color)

          .pipe(
            // delay(500),
            map(resp => {
              const loc = resp.headers.get('Location');
              return loc.substring(loc.lastIndexOf('/') + 1);
            }),
            map(id => { this.appendLog(`HTTP/1.1 201 Created\nLocation: /palettes/${id}\n`, 'text-success'); return { $oid: id }; }),
            catchError(res => { this.appendLog(`HTTP/1.1 400 Bad Request\n`, 'text-danger'); this.resetStatus(); return []; })
          ))
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

    of(`> PATCH /_sessions/${this.truncate(sid)}/_txns/${txn}`)
      .pipe(
        map(str => { console.log('msg', str); this.appendLog(`${str}`, 'text-light bg-primary'); return null; }),

        // Here execute the request
        mergeMap(() => this.palettesService.patch(`/_sessions/${sid}/_txns/${txn}`, null)

          .pipe(
            // delay(500),
            map(res => { this.appendLog(`HTTP/1.1 200 OK\n`, 'text-success'); this.txn = null; return res; }),
            catchError(res => { this.appendLog(`HTTP/1.1 400 Bad Request\n`, 'text-danger'); this.resetStatus(); return []; })
          )),
        map(() => { this.scroll(); return null; })
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

    of(`> DELETE /_sessions/${this.truncate(sid)}/_txns/${txn}`)
      .pipe(
        map(str => { console.log('msg', str); this.appendLog(`${str}`, 'text-light bg-primary'); return null; }),

        // Here execute the request
        mergeMap(() => this.palettesService.delete(`/_sessions/${sid}/_txns/${txn}`)

          .pipe(
            // delay(500),
            map(res => { this.appendLog(`HTTP/1.1 204 No Content\n`, 'text-success'); this.resetStatus(); return res; }),
            catchError(res => {
              this.appendLog(`HTTP/1.1 400 Bad Request\n`, 'text-danger');
              this.txn = null; return [];
            }))),
        map(() => { this.scroll(); return null; })
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
        map(str => { console.log('msg', str); this.appendLog(`${str}`, 'text-light bg-primary'); return null; }),

        // Here execute the request
        mergeMap(() => this.palettesService.delete('/palettes/*?filter={"_id":{"$exists":true}}')

          .pipe(
            // delay(500),
            map(res => {
              this.appendLog('HTTP/1.1 200 OK', 'text-success');
              this.appendLog(JSON.stringify(res, null, 2).concat('\n'), 'text-white');

              return res;
            }),
            catchError(res => { this.appendLog(`HTTP/1.1 400 Bad Request\n`, 'text-danger'); this.resetStatus(); return res; }))
        ),

        map(res => '> DELETE /colors/*?filter={"$oid":{"$exists":true}}'),

        map(str => { console.log('msg', str); this.appendLog(`${str}`, 'text-light bg-primary'); return null; }),

        // Here execute the request
        mergeMap(() => this.palettesService.delete(`/colors/*?filter={"_id":{"$exists":true}}`)

          .pipe(
            // delay(500),
            map(res => {
              this.appendLog('HTTP/1.1 200 OK', 'text-success');
              this.appendLog(JSON.stringify(res, null, 2).concat('\n'), 'text-white');

              return res;
            }),
            catchError(res => { this.appendLog(`HTTP/1.1 400 Bad Request\n`, 'text-danger'); this.resetStatus(); return []; }))
        ),
        map(() => { this.scroll(); return null; })
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

@Component({
  selector: 'app-request-zoom',
  templateUrl: './request-zoom.component.html',
})
export class RequestZoomComponent {

  constructor(
    public dialogRef: MatDialogRef<RequestZoomComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) { }

  close(): void {
    this.dialogRef.close();
  }
}
