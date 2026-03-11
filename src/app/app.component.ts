import { Component, inject } from '@angular/core';
import { 
  IonApp, IonRouterOutlet, IonMenu, IonContent, 
  IonButton, IonIcon, MenuController 
} from '@ionic/angular/standalone';
import { RouterLink } from '@angular/router';
import { addIcons } from 'ionicons';
import { homeOutline, calendarOutline, personOutline } from 'ionicons/icons';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: true,
  // Asegúrate de que todos los componentes de Ionic que usamos en el HTML estén aquí importados
  imports: [IonApp, IonRouterOutlet, IonMenu, IonContent, IonButton, IonIcon, RouterLink],
})
export class AppComponent {
  
  // Usamos la sintaxis moderna que le gustó a tu profesor 😉
  private menuCtrl = inject(MenuController);

  constructor() {
    // Registramos los íconos que usa tu menú
    addIcons({
      homeOutline,
      calendarOutline,
      personOutline
    });
  }

  // 👇 ¡Aquí está la función que nos faltaba! 👇
  closeMenu() {
    this.menuCtrl.close('main-menu');
  }
}