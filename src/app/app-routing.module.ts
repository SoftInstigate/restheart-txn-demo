import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from 'src/app/home/home.component';
import { PalettesComponent } from 'src/app/palettes/palettes.component';
import { NewPaletteComponent } from 'src/app/new-palette/new-palette.component';
import { AboutComponent } from 'src/app/about/about.component';

const routes: Routes = [
  { path: '',         component: HomeComponent },
  { path: 'palettes', component: PalettesComponent },
  { path: 'new',      component: NewPaletteComponent },
  { path: 'about',    component: AboutComponent },
  { path: '**', redirectTo: '/', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
