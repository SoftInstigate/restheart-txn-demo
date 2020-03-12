import { Component, OnInit } from '@angular/core';
import { PalettesService } from 'src/app/palettes.service';
import { Observable } from 'rxjs';
import { Palette } from 'src/app/model';

@Component({
  selector: 'app-palettes',
  templateUrl: './palettes.component.html',
  styleUrls: ['./palettes.component.css']
})
export class PalettesComponent implements OnInit {
  palettes: Observable<Palette[]>;

  constructor(private palettesService: PalettesService) { }

  ngOnInit(): void {
    this.palettes = this.palettesService.loadPalettes();
  }

}
