import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  IonContent,
  IonIcon, IonButton, IonDatetime, MenuController,
  ToastController, LoadingController // Agregamos los controladores para alertas
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  menuOutline, 
  personOutline, 
  checkmarkOutline, 
  closeOutline 
} from 'ionicons/icons';
import { RouterLink } from '@angular/router';

// 👇 Importamos los servicios
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

  // Arreglos vacíos al inicio, se llenarán con los datos reales
  highlightedDates: any[] = [];
  appointmentRequests: any[] = [];

  constructor() {
    addIcons({
      menuOutline,
      personOutline,
      checkmarkOutline,
      closeOutline
    });
  }

  // ⚠️ Quitamos ngOnInit y usamos ionViewWillEnter para evitar la caché
  ionViewWillEnter() {
    this.cargarCitas();
  }

  openMenu() {
    this.menuCtrl.open('main-menu');
  }

  // ==========================================
  // 1. CARGAR CITAS Y PINTAR EL CALENDARIO
  // ==========================================
  cargarCitas() {
    const user = this.authService.getCurrentUser();
    console.log('🕵️‍♂️ 1. Usuario actual en el frontend:', user);

    // Revisa si tu backend guarda el id como 'id' o '_id'
    const doctorId = user?.id || user?._id; 
    console.log('🕵️‍♂️ 2. ID que le vamos a pedir a Flask:', doctorId);

    if (doctorId) {
      this.appointmentService.getAppointmentsByDoctor(doctorId).subscribe({
        next: (response) => {
          console.log('🕵️‍♂️ 3. ¡Flask respondió! Esto nos mandó:', response);

          // OJO AQUÍ: Dependiendo de tu Flask, la respuesta puede venir directa 
          // (response) o dentro de un objeto (response.appointments)
          const todasLasCitas = response.appointments || response; 

          const pendientes = todasLasCitas.filter((cita: any) => cita.status === 'scheduled');
          console.log('🕵️‍♂️ 4. Citas pendientes filtradas:', pendientes);
          
          this.appointmentRequests = pendientes.map((cita: any) => ({
            id: cita._id || cita.id, 
            name: 'Paciente ' + (cita.patientId ? cita.patientId.substring(0, 4) : 'X'), 
            initial: 'P', 
            date: cita.date,
            time: cita.time,
            reason: cita.specialty
          }));

          const aceptadas = todasLasCitas.filter((cita: any) => cita.status === 'accepted');
          this.highlightedDates = aceptadas.map((cita: any) => ({
            date: cita.date,
            textColor: '#ffffff',
            backgroundColor: '#2aada0',
          }));
        },
        error: (err) => {
          console.error('❌ Error desde Flask:', err);
          this.mostrarToast('Error al cargar la agenda', 'danger');
        }
      });
    } else {
      console.warn('⚠️ No se encontró el ID del doctor. ¿Iniciaste sesión?');
    }
  }

  // ==========================================
  // 2. ACEPTAR CITA
  // ==========================================
  async acceptRequest(id: string) { // <-- Cambiado a string
    const loading = await this.loadingCtrl.create({ spinner: 'crescent' });
    await loading.present();

    this.appointmentService.updateAppointmentStatus(id, 'accepted').subscribe({
      next: () => {
        loading.dismiss();
        this.mostrarToast('Cita aceptada y agendada', 'success');
        this.cargarCitas(); // Recargamos para que se pinte en el calendario
      },
      error: () => {
        loading.dismiss();
        this.mostrarToast('Error al aceptar la cita', 'danger');
      }
    });
  }

  // ==========================================
  // 3. RECHAZAR CITA
  // ==========================================
  async rejectRequest(id: string) { // <-- Cambiado a string
    const loading = await this.loadingCtrl.create({ spinner: 'bubbles' });
    await loading.present();

    this.appointmentService.updateAppointmentStatus(id, 'cancelled').subscribe({
      next: () => {
        loading.dismiss();
        this.mostrarToast('Cita rechazada', 'warning');
        this.cargarCitas(); // Recargamos para quitarla de la lista
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