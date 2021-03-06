import { Component, OnInit, Input } from '@angular/core';
import { Observable } from 'rxjs';
import { PalettesService } from 'src/app/palettes.service';
import { Palette, Color } from 'src/app/model';

@Component({
  selector: 'app-palette',
  templateUrl: './palette.component.html',
  styleUrls: ['./palette.component.css']
})
export class PaletteComponent implements OnInit {
  @Input() palette: Palette;
  colors: Observable<Color[]>;

  constructor(private palettesService: PalettesService) { }

  ngOnInit(): void {
    this.colors = this.palettesService.loadColors(this.palette._id);
  }
}
