import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  IonContent,
  IonIcon, IonButton, IonDatetime 
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  menuOutline, 
  personOutline, 
  checkmarkOutline, 
  closeOutline 
} from 'ionicons/icons';

@Component({
  selector: 'app-appointments-doc',
  templateUrl: './appointments-doc.page.html',
  styleUrls: ['./appointments-doc.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    CommonModule, FormsModule,
    IonIcon, IonButton, IonDatetime
  ]
})
export class AppointmentsDocPage implements OnInit {
  
  // Colores exactos de tu CSS para resaltar los días
  highlightedDates = [
    {
      date: '2024-05-15', // Cambia esto al mes actual para que lo veas marcado
      textColor: '#ffffff',
      backgroundColor: '#145da0', // var(--blue)
    },
    {
      date: '2024-05-22',
      textColor: '#ffffff',
      backgroundColor: '#2aada0', // var(--teal)
    }
  ];

  appointmentRequests = [
   {
      id: 1,
      name: 'Juan Perez',
      initial: 'J',
      date: '25 May 2026',
      time: '10:00 AM',
      reason: 'General Checkup' // <-- Traducido de Revisión General
    },
    {
      id: 2,
      name: 'Maria Rodriguez',
      initial: 'M',
      date: '26 May 2026',
      time: '2:30 PM',
      reason: 'Specialist Consultation' // <-- Traducido de Consulta Especialista
    }
  ];

  constructor() {
    // Registramos los íconos para que funcionen
    addIcons({
      menuOutline,
      personOutline,
      checkmarkOutline,
      closeOutline
    });
  }

  ngOnInit() {
    // Lógica al iniciar la página (vacío por ahora)
  }

  acceptRequest(id: number) {
    console.log(`Cita aceptada: ${id}`);
  }

  rejectRequest(id: number) {
    console.log(`Cita rechazada: ${id}`);
  }
}