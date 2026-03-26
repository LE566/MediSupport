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
// private apiUrl = 'https://medisupport-production.up.railway.app/api/appointments';
private apiUrl = 'http://localhost:5000/api/appointments'; // 👈 Usa esta para probar
  
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

  // REAGENDAR CITA
  rescheduleAppointment(id: string, newDate: string, newTime: string) {
    // 👇 Le quitamos el '/appointments' y lo dejamos solo con '/reschedule'
    return this.http.patch(`${this.apiUrl}/reschedule/${id}`, {
      date: newDate,
      time: newTime,
      status: 'accepted' // Lo pasamos a aceptado automáticamente
    });
  }

  createAppointment(appointmentData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}`, appointmentData);
  }

  getAvailableTimes(doctorId: string, date: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/available-times?doctorId=${doctorId}&date=${date}`);
  }
}