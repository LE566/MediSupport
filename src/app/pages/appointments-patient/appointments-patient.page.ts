import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  IonContent,
  IonIcon, IonButton, IonDatetime, MenuController, ToastController, LoadingController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  menuOutline, 
  personOutline, 
  closeOutline,
  timeOutline,             
  checkmarkCircleOutline,  
  closeCircleOutline,
  calendarOutline,
  checkmarkCircle
} from 'ionicons/icons';
import { RouterLink } from '@angular/router';

// 👇 Servicios Reales
import { AuthService } from '../../services/auth.service';
import { AppointmentService } from '../../services/appointment.service';

@Component({
  selector: 'app-appointments-patient',
  templateUrl: './appointments-patient.page.html',
  styleUrls: ['./appointments-patient.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    CommonModule, FormsModule,
    IonIcon, IonButton, IonDatetime, RouterLink,
  ]
})
export class AppointmentsPatientPage {
  
  private menuCtrl = inject(MenuController);
  private authService = inject(AuthService);
  private appointmentService = inject(AppointmentService);
  private toastCtrl = inject(ToastController);
  private loadingCtrl = inject(LoadingController);

  // Arreglos para nuestras listas
  highlightedDates: any[] = [];
  pendingAppointments: any[] = []; // Citas que están esperando respuesta (scheduled)
  mySchedule: any[] = [];          // Citas aceptadas y rechazadas (accepted / cancelled)
  pastAppointments: any[] = [];    // Citas que ya sucedieron (completed) - Para el futuro

  constructor() {
    addIcons({
      menuOutline, personOutline, closeOutline, timeOutline,
      checkmarkCircleOutline, closeCircleOutline, calendarOutline, checkmarkCircle
    });
  }

  ionViewWillEnter() {
    this.cargarCitasPaciente();
  }

  openMenu() {
    this.menuCtrl.open('main-menu');
  }

  cargarCitasPaciente() {
    const user = this.authService.getCurrentUser();
    const patientId = user?.id || user?._id; 

    if (patientId) {
      this.appointmentService.getAppointmentsByPatient(patientId).subscribe({
        next: (response) => {
          const todasLasCitas = response.appointments || response; 

          // 1. PENDIENTES (Las que dicen 'scheduled' en tu BD)
          const pendientes = todasLasCitas.filter((c: any) => c.status === 'scheduled');
          this.pendingAppointments = pendientes.map(this.mapearCita);

          // 2. MI AGENDA (Aceptadas o Rechazadas)
          const agendadas = todasLasCitas.filter((c: any) => c.status === 'accepted' || c.status === 'cancelled');
          this.mySchedule = agendadas.map(this.mapearCita);

          // Llenar calendario con las aceptadas
          const aceptadas = todasLasCitas.filter((c: any) => c.status === 'accepted');
          this.highlightedDates = aceptadas.map((c: any) => ({
            date: c.date,
            textColor: '#ffffff',
            backgroundColor: '#145da0', // Azul paciente
          }));

          // 3. PASADAS (completed)
          const completadas = todasLasCitas.filter((c: any) => c.status === 'completed');
          this.pastAppointments = completadas.map(this.mapearCita);

        },
        error: (err) => {
          console.error('Error al cargar citas:', err);
          this.mostrarToast('Error al cargar tu agenda', 'danger');
        }
      });
    }
  }

  // Función de ayuda para darle formato a los datos
  mapearCita(cita: any) {
    return {
      id: cita._id || cita.id,
      doctorName: 'Doctor ID: ' + (cita.doctorId ? cita.doctorId.substring(0, 4) : 'X'), // Aquí podrías hacer otra petición para sacar el nombre real
      initial: 'Dr',
      date: cita.date,
      time: cita.time,
      specialty: cita.specialty,
      status: cita.status // 'scheduled', 'accepted', 'cancelled', 'completed'
    };
  }

  // Función para devolver el icono correcto en el HTML
  getStatusIcon(status: string): string {
    switch (status) {
      case 'accepted': return 'checkmark-circle-outline';
      case 'scheduled': return 'time-outline';
      case 'cancelled': return 'close-circle-outline';
      case 'completed': return 'checkmark-circle';
      default: return 'time-outline';
    }
  }

  // Función para devolver el color del icono
  getStatusColor(status: string): string {
    switch (status) {
      case 'accepted': return '#2a2ead'; // Verde
      case 'scheduled': return '#e8ae31'; // Amarillo
      case 'cancelled': return '#eb445a'; // Rojo
      case 'completed': return '#3880ff'; // Azul
      default: return '#92949c';
    }
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