import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  IonContent,
  IonIcon, IonButton, IonDatetime, MenuController,
  ToastController, LoadingController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  menuOutline, 
  personOutline, 
  checkmarkOutline, 
  closeOutline 
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
    IonContent,
    CommonModule, FormsModule,
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
  
  // 👇 1. NUEVA VARIABLE: Aquí guardaremos las citas que ya aceptó el doctor
  acceptedAppointments: any[] = []; 

  constructor() {
    addIcons({
      menuOutline,
      personOutline,
      checkmarkOutline,
      closeOutline
    });
  }

  ionViewWillEnter() {
    this.cargarCitas();
  }

  openMenu() {
    this.menuCtrl.open('main-menu');
  }

  cargarCitas() {
    const user = this.authService.getCurrentUser();
    const doctorId = user?.id || user?._id; 

    if (doctorId) {
      this.appointmentService.getAppointmentsByDoctor(doctorId).subscribe({
        next: (response) => {
          const todasLasCitas = response.appointments || response; 

          // --- MONTÓN 1: LAS PENDIENTES ---
          const pendientes = todasLasCitas.filter((cita: any) => cita.status === 'scheduled');
          
          this.appointmentRequests = pendientes.map((cita: any) => ({
            id: cita._id || cita.id, 
            name: 'Paciente ' + (cita.patientId ? cita.patientId.substring(0, 4) : 'X'), 
            initial: 'P', 
            date: cita.date,
            time: cita.time,
            reason: cita.specialty
          }));

          // --- MONTÓN 2: LAS ACEPTADAS ---
          const aceptadas = todasLasCitas.filter((cita: any) => cita.status === 'accepted');
          
          // A) Las usamos para el calendario (esto ya lo tenías)
          this.highlightedDates = aceptadas.map((cita: any) => ({
            date: cita.date,
            textColor: '#ffffff',
            backgroundColor: '#2aada0',
          }));

          // 👇 B) NUEVO: Las guardamos en nuestra nueva lista para pintarlas abajo
          this.acceptedAppointments = aceptadas.map((cita: any) => ({
            id: cita._id || cita.id, 
            name: 'Paciente ' + (cita.patientId ? cita.patientId.substring(0, 4) : 'X'), 
            initial: 'P', 
            date: cita.date,
            time: cita.time,
            reason: cita.specialty
          }));

        },
        error: (err) => {
          console.error('❌ Error desde Flask:', err);
          this.mostrarToast('Error al cargar la agenda', 'danger');
        }
      });
    } else {
      console.warn('⚠️ No se encontró el ID del doctor.');
    }
  }

  async acceptRequest(id: string) { 
    const loading = await this.loadingCtrl.create({ spinner: 'crescent' });
    await loading.present();

    this.appointmentService.updateAppointmentStatus(id, 'accepted').subscribe({
      next: () => {
        loading.dismiss();
        this.mostrarToast('Cita aceptada y agendada', 'success');
        this.cargarCitas(); 
      },
      error: () => {
        loading.dismiss();
        this.mostrarToast('Error al aceptar la cita', 'danger');
      }
    });
  }

  async rejectRequest(id: string) { 
    const loading = await this.loadingCtrl.create({ spinner: 'bubbles' });
    await loading.present();

    this.appointmentService.updateAppointmentStatus(id, 'cancelled').subscribe({
      next: () => {
        loading.dismiss();
        this.mostrarToast('Cita rechazada', 'warning');
        this.cargarCitas(); 
      },
      error: () => {
        loading.dismiss();
        this.mostrarToast('Error al rechazar la cita', 'danger');
      }
    });
  }

  async mostrarToast(mensaje: string, color: string) {
    const toast = await this.toastCtrl.create({
      message: mensaje,
      duration: 2000,
      color: color,
      position: 'bottom'
    });
    await toast.present();
  }
}