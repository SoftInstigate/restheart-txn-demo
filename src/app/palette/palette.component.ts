import { Component, OnInit, Input } from '@angular/core';
import { Palette } from 'src/app/model';

@Component({
  selector: 'app-palette',
  templateUrl: './palette.component.html',
  styleUrls: ['./palette.component.css']
})
export class PaletteComponent implements OnInit {
  @Input() palette: Palette;

  constructor() { }

  ngOnInit(): void {
  }

}
