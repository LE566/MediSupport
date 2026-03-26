import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  IonContent, IonIcon, IonButton, IonDatetime, 
  MenuController, ToastController, LoadingController,
  IonItem, IonSelect, IonSelectOption, IonTextarea, IonSpinner
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  menuOutline, personOutline, closeOutline, timeOutline,            
  checkmarkCircleOutline, closeCircleOutline, calendarOutline, checkmarkCircle,
  medkitOutline
} from 'ionicons/icons';
import { RouterLink } from '@angular/router';

import { AuthService } from '../../services/auth.service';
import { AppointmentService } from '../../services/appointment.service';

@Component({
  selector: 'app-appointments-patient',
  templateUrl: './appointments-patient.page.html',
  styleUrls: ['./appointments-patient.page.scss'],
  standalone: true,
  imports: [
    IonContent, CommonModule, FormsModule, IonIcon, IonButton, IonDatetime, RouterLink,
    IonItem, IonSelect, IonSelectOption, IonTextarea, IonSpinner
  ]
})
export class AppointmentsPatientPage {
  
  private menuCtrl = inject(MenuController);
  private authService = inject(AuthService);
  private appointmentService = inject(AppointmentService);
  private toastCtrl = inject(ToastController);
  private loadingCtrl = inject(LoadingController);

  // Arrays for lists
  highlightedDates: any[] = [];
  pendingAppointments: any[] = []; 
  mySchedule: any[] = [];          
  pastAppointments: any[] = [];    

  // Variables for the new appointment form
  minDate = new Date().toISOString(); 
  availableTimes: string[] = []; 
  doctors: any[] = []; 
  isLoadingTimes = false;
  
  newAppointment = {
    doctorId: '',
    date: '',
    time: '',
    reason: ''
  };

  constructor() {
    addIcons({
      menuOutline, personOutline, closeOutline, timeOutline,
      checkmarkCircleOutline, closeCircleOutline, calendarOutline, checkmarkCircle,
      medkitOutline 
    });
  }

  ionViewWillEnter() {
    // 🔥 First load doctors, THEN load appointments to match the names
    this.loadDoctorsAndAppointments();
  }

  openMenu() {
    this.menuCtrl.open('main-menu');
  }

  loadDoctorsAndAppointments() {
    this.authService.getDoctors().subscribe({
      next: (response) => {
        this.doctors = response.doctors;
        this.loadPatientAppointments(); // Load appointments after we have the doctors list
      },
      error: (err) => {
        console.error('Error loading doctors:', err);
        this.showToast('Could not load doctor list', 'warning');
      }
    });
  }

  loadPatientAppointments() {
    const user = this.authService.getCurrentUser();
    const patientId = user?.id || user?._id; 

    if (patientId) {
      this.appointmentService.getAppointmentsByPatient(patientId).subscribe({
        next: (response) => {
          const allAppointments = response.appointments || response; 

          const pending = allAppointments.filter((c: any) => c.status === 'scheduled');
          this.pendingAppointments = pending.map(this.mapAppointment);

          const scheduled = allAppointments.filter((c: any) => c.status === 'accepted' || c.status === 'cancelled');
          this.mySchedule = scheduled.map(this.mapAppointment);

          const accepted = allAppointments.filter((c: any) => c.status === 'accepted');
          this.highlightedDates = accepted.map((c: any) => ({
            date: c.date,
            textColor: '#ffffff',
            backgroundColor: '#145da0', 
          }));

          const completed = allAppointments.filter((c: any) => c.status === 'completed');
          this.pastAppointments = completed.map(this.mapAppointment);
        },
        error: (err) => {
          console.error('Error loading appointments:', err);
          this.showToast('Error loading your schedule', 'danger');
        }
      });
    }
  }

  // 🔥 Matches the Doctor ID with the real Doctor Name 🔥
  mapAppointment = (appointment: any) => {
    const doc = this.doctors.find(d => d.id === appointment.doctorId);
    const doctorName = doc ? doc.name : 'Unknown Doctor';

    return {
      id: appointment._id || appointment.id,
      doctorName: doctorName, 
      initial: doctorName.charAt(0).toUpperCase(),
      date: appointment.date,
      time: appointment.time,
      specialty: appointment.specialty,
      status: appointment.status 
    };
  }

  isDateEnabled = (dateIsoString: string) => {
    const date = new Date(dateIsoString);
    const day = date.getUTCDay();
    // Bloquear fines de semana (Domingo = 0, Sábado = 6)
    if (day === 0 || day === 6) {
      return false; 
    }
    
    return true; 
  };

  onDateOrDoctorSelected() {
    if (this.newAppointment.doctorId && this.newAppointment.date) {
      this.isLoadingTimes = true;
      this.availableTimes = []; 
      this.newAppointment.time = ''; 
      
      const dateStr = this.newAppointment.date.split('T')[0]; 

      this.appointmentService.getAvailableTimes(this.newAppointment.doctorId, dateStr).subscribe({
        next: (response) => {
          this.availableTimes = response.available_times;
          this.isLoadingTimes = false;
        },
        error: (err) => {
          console.error('Error loading times', err);
          this.showToast('Error loading availability', 'warning');
          this.isLoadingTimes = false;
        }
      });
    }
  }

  async submitAppointmentRequest() {
    if (!this.newAppointment.doctorId || !this.newAppointment.date || !this.newAppointment.time) {
      this.showToast('Please select a doctor, date, and time', 'warning');
      return;
    }

    const user = this.authService.getCurrentUser();
    const payload = {
      doctorId: this.newAppointment.doctorId,
      patientId: user?.id || user?._id,
      date: this.newAppointment.date.split('T')[0], 
      time: this.newAppointment.time,
      reason: this.newAppointment.reason || 'General Checkup'
    };

    const loading = await this.loadingCtrl.create({ spinner: 'crescent' });
    await loading.present();

    this.appointmentService.createAppointment(payload).subscribe({
      next: () => {
        loading.dismiss();
        this.showToast('Appointment requested successfully', 'success');
        
        // Reset form and reload
        this.newAppointment = { doctorId: '', date: '', time: '', reason: '' };
        this.availableTimes = [];
        this.loadPatientAppointments(); 
      },
      error: (err) => {
        loading.dismiss();
        console.error(err);
        this.showToast('Error requesting appointment', 'danger');
      }
    });
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'accepted': return 'checkmark-circle-outline';
      case 'scheduled': return 'time-outline';
      case 'cancelled': return 'close-circle-outline';
      case 'completed': return 'checkmark-circle';
      default: return 'time-outline';
    }
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'accepted': return '#2a2ead'; 
      case 'scheduled': return '#e8ae31'; 
      case 'cancelled': return '#eb445a'; 
      case 'completed': return '#3880ff'; 
      default: return '#92949c';
    }
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