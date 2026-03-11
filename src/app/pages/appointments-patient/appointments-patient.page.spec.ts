import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppointmentsPatientPage } from './appointments-patient.page';

describe('AppointmentsPatientPage', () => {
  let component: AppointmentsPatientPage;
  let fixture: ComponentFixture<AppointmentsPatientPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AppointmentsPatientPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
