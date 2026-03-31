import { Component, inject, OnInit } from '@angular/core';
import { 
  IonApp, IonRouterOutlet, IonMenu, IonContent, 
  IonButton, IonIcon, MenuController 
} from '@ionic/angular/standalone';
import { RouterLink } from '@angular/router';
import { addIcons } from 'ionicons';
import { homeOutline, calendarOutline, personOutline, flaskOutline} from 'ionicons/icons';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: true,
  imports: [IonApp, IonRouterOutlet, IonMenu, IonContent, IonButton, IonIcon, RouterLink],
})
export class AppComponent {
  
  private menuCtrl = inject(MenuController);
  private authService = inject(AuthService);
  userRole: string = '';

  ngOnInit() {
    this.applySavedSettings();
  }

  private applySavedSettings() {
    const darkMode = localStorage.getItem('medisupport_dark_mode') === 'true';
    document.body.classList.toggle('dark', darkMode);
    document.body.classList.toggle('light', !darkMode);
    document.documentElement.classList.toggle('ion-palette-dark', darkMode);
    
    const textSize = localStorage.getItem('medisupport_text_size') || 'medium';
    document.body.classList.remove('text-small', 'text-medium', 'text-large');
    document.body.classList.add('text-' + textSize);
    document.documentElement.classList.remove('text-small', 'text-medium', 'text-large');
    document.documentElement.classList.add('text-' + textSize);
  }

  constructor() {
    // Registramos los íconos que usa tu menú
    addIcons({
      homeOutline,
      calendarOutline,
      personOutline,
      flaskOutline
    });
  }

 

  // Funcion para el rol
  actualizarRol(){
    const user = this.authService.getCurrentUser();
    this.userRole = user ? user.role : ''
  }

  closeMenu() {
    this.menuCtrl.close('main-menu');
  }
}