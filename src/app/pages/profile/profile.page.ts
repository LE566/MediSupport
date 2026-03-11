import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, 
  IonBackButton, IonButton, IonIcon, IonItem, IonInput, 
  IonLabel, IonToggle 
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  closeOutline, createOutline, camera, shieldCheckmarkOutline, 
  personOutline, mailOutline, fingerPrintOutline, notificationsOutline, 
  settingsOutline, documentTextOutline, chevronForwardOutline, 
  saveOutline, logOutOutline 
} from 'ionicons/icons';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: true,
  imports: [
    IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule,
    IonButtons, IonBackButton, IonButton, IonIcon, IonItem, IonInput, 
    IonLabel, IonToggle, RouterLink
  ]
})
export class ProfilePage implements OnInit {
  
  // Variables de estado
  isEditing: boolean = false;
  biometricsEnabled: boolean = true;
  notificationsEnabled: boolean = true;

  // Objeto simulado de usuario
  user: any = {
    name: 'Carlos Mendoza',
    email: 'carlos.mendoza@email.com',
    avatarUrl: 'https://ionicframework.com/docs/img/demos/avatar.svg'
  };

  constructor() {
    // Registrar iconos que usamos en el template
    addIcons({
      closeOutline, createOutline, camera, shieldCheckmarkOutline, 
      personOutline, mailOutline, fingerPrintOutline, notificationsOutline, 
      settingsOutline, documentTextOutline, chevronForwardOutline, 
      saveOutline, logOutOutline
    });
  }

  ngOnInit() {}

  toggleEdit() {
    this.isEditing = !this.isEditing;
  }

  changeProfilePicture() {
    if (!this.isEditing) return;
    console.log('Abrir selector de imágenes o cámara...');
  }

  saveChanges() {
    console.log('Guardando datos del usuario:', this.user);
    this.isEditing = false;
  }

  logout() {
    console.log('Cerrando sesión...');
    // Lógica para ir al login o borrar token
  }
}