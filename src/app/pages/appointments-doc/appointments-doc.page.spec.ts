import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppointmentsDocPage } from './appointments-doc.page';

describe('AppointmentsDocPage', () => {
  let component: AppointmentsDocPage;
  let fixture: ComponentFixture<AppointmentsDocPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AppointmentsDocPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
