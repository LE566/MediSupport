import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  IonContent, IonIcon, IonButton, IonDatetime, MenuController,
  ToastController, LoadingController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  menuOutline, personOutline, checkmarkOutline, closeOutline,
  calendarOutline, timeOutline, checkmarkCircleOutline, checkmarkDoneOutline
} from 'ionicons/icons';
import { RouterLink } from '@angular/router';

import { AuthService } from '../../services/auth.service';
import { AppointmentService } from '../../services/appointment.service';

@Component({
  selector: 'app-appointments-doc',
  templateUrl: './appointments-doc.page.html',
  styleUrls: ['./appointments-doc.page.scss'],
  standalone: true,
  imports: [
    IonContent, CommonModule, FormsModule,
    IonIcon, IonButton, IonDatetime, RouterLink,
  ]
})
export class AppointmentsDocPage {
  
  private menuCtrl = inject(MenuController);
  private authService = inject(AuthService);
  private appointmentService = inject(AppointmentService);
  private toastCtrl = inject(ToastController);
  private loadingCtrl = inject(LoadingController);

  highlightedDates: any[] = [];
  appointmentRequests: any[] = [];
  acceptedAppointments: any[] = []; 
  patients: any[] = []; // 👈 Lista para guardar nombres reales

  constructor() {
    addIcons({
      menuOutline, personOutline, checkmarkOutline, closeOutline,
      calendarOutline, timeOutline, checkmarkCircleOutline, checkmarkDoneOutline
    });
  }

  ionViewWillEnter() {
    this.loadPatientsAndAppointments();
  }

  openMenu() {
    this.menuCtrl.open('main-menu');
  }

  // 1. Cargamos pacientes primero para tener sus nombres
  loadPatientsAndAppointments() {
    this.authService.getAllUsers().subscribe({
      next: (users) => {
        this.patients = users;
        this.loadDoctorAppointments();
      },
      error: () => {
        this.showToast('Could not load patient directory', 'warning');
        this.loadDoctorAppointments(); // Intentamos cargar citas de todos modos
      }
    });
  }

  loadDoctorAppointments() {
    const user = this.authService.getCurrentUser();
    const doctorId = user?.id || user?._id; 

    if (doctorId) {
      this.appointmentService.getAppointmentsByDoctor(doctorId).subscribe({
        next: (response) => {
          const allAppointments = response.appointments || response; 

          // --- PENDING ---
          const pending = allAppointments.filter((cita: any) => cita.status === 'scheduled');
          this.appointmentRequests = pending.map(this.mapAppointment);

          // --- ACCEPTED ---
          const accepted = allAppointments.filter((cita: any) => cita.status === 'accepted');
          this.acceptedAppointments = accepted.map(this.mapAppointment);

          // Calendario (solo mostramos las aceptadas en el calendario)
          this.highlightedDates = accepted.map((cita: any) => ({
            date: cita.date,
            textColor: '#ffffff',
            backgroundColor: '#2aada0',
          }));

        },
        error: (err) => {
          console.error('Error fetching from Flask:', err);
          this.showToast('Error loading schedule', 'danger');
        }
      });
    }
  }

  // 2. Función para mapear nombres y formato
  mapAppointment = (cita: any) => {
    const patient = this.patients.find(p => p.id === cita.patientId);
    const patientName = patient ? patient.fullName : 'Unknown Patient';

    return {
      id: cita._id || cita.id, 
      name: patientName, 
      initial: patientName.charAt(0).toUpperCase(), 
      date: cita.date,
      time: cita.time,
      reason: cita.specialty,
      status: cita.status
    };
  }

  async acceptRequest(id: string) { 
    const loading = await this.loadingCtrl.create({ spinner: 'crescent' });
    await loading.present();

    this.appointmentService.updateAppointmentStatus(id, 'accepted').subscribe({
      next: () => {
        loading.dismiss();
        this.showToast('Appointment accepted', 'success');
        this.loadDoctorAppointments(); 
      },
      error: () => {
        loading.dismiss();
        this.showToast('Error accepting appointment', 'danger');
      }
    });
  }

  async rejectRequest(id: string) { 
    const loading = await this.loadingCtrl.create({ spinner: 'bubbles' });
    await loading.present();

    this.appointmentService.updateAppointmentStatus(id, 'cancelled').subscribe({
      next: () => {
        loading.dismiss();
        this.showToast('Appointment rejected', 'warning');
        this.loadDoctorAppointments(); 
      },
      error: () => {
        loading.dismiss();
        this.showToast('Error rejecting appointment', 'danger');
      }
    });
  }

  // 3. NUEVO: Función para marcar la cita como completada
  async completeRequest(id: string) { 
    const loading = await this.loadingCtrl.create({ spinner: 'crescent' });
    await loading.present();

    this.appointmentService.updateAppointmentStatus(id, 'completed').subscribe({
      next: () => {
        loading.dismiss();
        this.showToast('Appointment marked as completed', 'success');
        this.loadDoctorAppointments(); 
      },
      error: () => {
        loading.dismiss();
        this.showToast('Error updating appointment', 'danger');
      }
    });
  }

  async showToast(message: string, color: string) {
    const toast = await this.toastCtrl.create({
      message: message,
      duration: 2000,
      color: color,
      position: 'bottom'
    });
    await toast.present();
  }
}