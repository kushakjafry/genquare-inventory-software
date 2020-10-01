import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SkuIdDialogComponent } from './sku-id-dialog.component';

describe('SkuIdDialogComponent', () => {
  let component: SkuIdDialogComponent;
  let fixture: ComponentFixture<SkuIdDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SkuIdDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SkuIdDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
