import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PaletteCreationLogComponent } from './palette-creation-log.component';

describe('PaletteCreationLogComponent', () => {
  let component: PaletteCreationLogComponent;
  let fixture: ComponentFixture<PaletteCreationLogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PaletteCreationLogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PaletteCreationLogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
