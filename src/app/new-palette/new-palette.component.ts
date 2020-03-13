import { Component, OnInit } from '@angular/core';
import { Observable, of } from 'rxjs';
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
  constructor() { }

  ngOnInit(): void {
  }

  appendLog(msg: string): void {
    this.log += msg += '\n';
  }

  run() {
    const palette: Palette = new Palette(null, 'new palette');

    const color1 = new Color(new ObjectId('1'), 'green', '#66bb6a');
    const color2 = new Color(new ObjectId('2'), 'blu', '#2196f3');
    const color3 = new Color(new ObjectId('3'), 'lime', '#d4e157');
    const color4 = new Color(new ObjectId('4'), 'red', '#b71c1c');
    const color5 = new Color(new ObjectId('5'), 'pink', '#2196f3');

    of('> POST /_sessions').pipe(
      map(str => { this.appendLog(`${str}`); return null; }),
      mergeMap(() => this.createSession()),
      map(sid => { this.appendLog(`HTTP/1.1 201 Created\nLocation: /_sessions/${sid}\n`); return sid; }),
      map(sid => { this.appendLog(`> POST /_sessions/${sid}/_txns`); return sid; }),
      mergeMap(sid => this.startTxn(sid).pipe(
        map(txn => { this.appendLog(`HTTP/1.1 201 Created\nLocation: /_sessions/${sid}/_txns/${txn}\n`); return txn; }),

        map(txn => { this.appendLog(`------------------ TRANSACTION STARTED ------------------\n`); return txn; }),

        map(txn => { this.appendLog(`> POST /palettes?sid=${sid}&txn=${txn}`); return txn; }),
        mergeMap(txn => this.writePalette(sid, txn, palette).pipe(
          map(pid => { this.appendLog(`HTTP/1.1 201 Created\nLocation: /palettes/${pid.$oid}\n`); return pid; }),

          map(pid => { this.appendLog(`> POST /colors?sid=${sid}&txn=${txn}`); return pid; }),
          mergeMap(pid => this.writeColor(sid, txn, pid, color1)),
          map(cid => { this.appendLog(`HTTP/1.1 201 Created\nLocation: /colors/${cid.$oid}\n`); return cid; }),

          map(cid => { this.appendLog(`> POST /colors?sid=${sid}&txn=${txn}`); return cid; }),
          mergeMap(pid => this.writeColor(sid, txn, pid, color2)),
          map(cid => { this.appendLog(`HTTP/1.1 201 Created\nLocation: /colors/${cid.$oid}\n`); return cid; }),


          map(pid => { this.appendLog(`> POST /colors?sid=${sid}&txn=${txn}`); return pid; }),
          mergeMap(pid => this.writeColor(sid, txn, pid, color3)),
          map(cid => { this.appendLog(`HTTP/1.1 201 Created\nLocation: /colors/${cid.$oid}\n`); return cid; }),

          map(pid => { this.appendLog(`> POST /colors?sid=${sid}&txn=${txn}`); return pid; }),
          mergeMap(pid => this.writeColor(sid, txn, pid, color4)),
          map(cid => { this.appendLog(`HTTP/1.1 201 Created\nLocation: /colors/${cid.$oid}\n`); return cid; }),

          map(pid => { this.appendLog(`> POST /colors?sid=${sid}&txn=${txn}`); return pid; }),
          mergeMap(pid => this.writeColor(sid, txn, pid, color5)),
          map(cid => { this.appendLog(`HTTP/1.1 201 Created\nLocation: /colors/${cid.$oid}\n`); return cid; }),

          map(cid => { this.appendLog(`> PATCH /_sessions/${sid}/_txns/${txn}`); return sid; }),
          mergeMap(() => this.commitTxn(sid, txn)),
          map(cid => { this.appendLog(`HTTP/1.1 200 OK\n`); return cid; }),
          
          map(pid => { this.appendLog(`------------------ TRANSACTION COMMITTED -----------------`); return pid; }))
        ))
      ))
      .subscribe(() => this.created = true);
  }

  /**
   * @returns the id of the created session
   */
  private createSession(): Observable<string> {
    return of('12313-dffs-44543-432sdf').pipe(delay(500));
  }

  /**
   * @param sid the session id
   * @returns the id of the started txn
   */
  private startTxn(sid: string): Observable<string> {
    return of('1').pipe(delay(1000));
  }

  /**
   * @param sid the session id
   * @returns true
   */
  private commitTxn(sid: string, txn: string): Observable<boolean> {
    return of(true).pipe(delay(1000));
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
