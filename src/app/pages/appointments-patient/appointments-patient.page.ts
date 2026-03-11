import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  IonContent,
  IonIcon, IonButton, IonDatetime, MenuController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  menuOutline, 
  personOutline, 
  closeOutline,
  timeOutline,             // Para citas pendientes
  checkmarkCircleOutline,  // Para citas aceptadas
  closeCircleOutline,       // Para citas denegadas
} from 'ionicons/icons';
import { RouterLink } from '@angular/router';

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
export class AppointmentsPatientPage implements OnInit {
  
  private menuCtrl = inject(MenuController);

  highlightedDates = [
    {
      date: '2026-05-15', 
      textColor: '#ffffff',
      backgroundColor: '#145da0', 
    },
    {
      date: '2026-05-22',
      textColor: '#ffffff',
      backgroundColor: '#2aada0', 
    }
  ];

  // Citas actuales (Pendientes, Aceptadas, Denegadas)
  myAppointments = [
    {
      id: 1,
      doctorName: 'Dr. Emily Chen',
      initial: 'EC',
      date: '25 May 2026',
      time: '10:00 AM',
      specialty: 'Cardiology',
      status: 'accepted' // puede ser: 'accepted', 'pending', 'denied'
    },
    {
      id: 2,
      doctorName: 'Dr. Marcus Johnson',
      initial: 'MJ',
      date: '28 May 2026',
      time: '2:30 PM',
      specialty: 'General Practice',
      status: 'pending'
    },
    {
      id: 3,
      doctorName: 'Dr. Sarah Williams',
      initial: 'SW',
      date: '10 May 2026',
      time: '11:00 AM',
      specialty: 'Dermatology',
      status: 'denied'
    }
  ];

  // Historial de citas pasadas
  pastAppointments = [
    {
      id: 4,
      doctorName: 'Dr. Alan Grant',
      initial: 'AG',
      date: '15 Mar 2026',
      time: '09:00 AM',
      specialty: 'Orthopedics',
      status: 'completed'
    }
  ];

  constructor() {
    addIcons({
      menuOutline,
      personOutline,
      closeOutline,
      timeOutline,
      checkmarkCircleOutline,
      closeCircleOutline
    });
  }

  ngOnInit() {}

  cancelAppointment(id: number) {
    console.log(`Cancelando cita: ${id}`);
    // Aquí iría tu lógica para cancelar
  }

openMenu() {
    this.menuCtrl.open('main-menu');
  }

  // Utilidad para cambiar el ícono dependiendo del estado
  getStatusIcon(status: string): string {
    switch (status) {
      case 'accepted': return 'checkmark-circle-outline';
      case 'pending': return 'time-outline';
      case 'denied': return 'close-circle-outline';
      case 'completed': return 'checkmark-circle-outline';
      default: return 'time-outline';
    }
  }
}