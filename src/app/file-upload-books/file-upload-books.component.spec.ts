import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FileUploadBooksComponent } from './file-upload-books.component';

describe('FileUploadBooksComponent', () => {
  let component: FileUploadBooksComponent;
  let fixture: ComponentFixture<FileUploadBooksComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FileUploadBooksComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FileUploadBooksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
