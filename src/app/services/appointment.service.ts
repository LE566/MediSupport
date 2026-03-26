import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Appointment {
  _id: string;
  patientId: string;
  doctorId: string;
  date: string;
  time: string;
  specialty: string;
  status: string; // 'scheduled', 'accepted', 'cancelled', 'completed'
  createdAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class AppointmentService {
  // Ajusta el puerto si tu Flask corre en otro lado
  private apiUrl = 'http://medisupport-production.up.railway.app/api/appointments'; 
  
  private http = inject(HttpClient);

  constructor() { }

  // ==========================================
  // OBTENER CITAS
  // ==========================================
  
  // Para la pantalla del Doctor
  getAppointmentsByDoctor(doctorId: string): Observable<{ appointments: Appointment[] }> {
    return this.http.get<{ appointments: Appointment[] }>(`${this.apiUrl}?doctorId=${doctorId}`);
  }

  // Para la pantalla del Paciente
  getAppointmentsByPatient(patientId: string): Observable<{ appointments: Appointment[] }> {
    return this.http.get<{ appointments: Appointment[] }>(`${this.apiUrl}/patient?patientId=${patientId}`);
  }

  // ==========================================
  // ACTUALIZAR ESTADO (Aceptar/Rechazar)
  // ==========================================
  
  updateAppointmentStatus(appointmentId: string, newStatus: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${appointmentId}/status`, { status: newStatus });
  }

  createAppointment(appointmentData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}`, appointmentData);
  }

  getAvailableTimes(doctorId: string, date: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/available-times?doctorId=${doctorId}&date=${date}`);
  }
}