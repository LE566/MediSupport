import { Component, OnInit, inject} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonIcon, IonButton, MenuController } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons'; 
import { 
  menuOutline, 
      personOutline, 
      shieldCheckmarkOutline, 
      alertCircleOutline, 
      add
} from 'ionicons/icons';
import { RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [IonContent, IonIcon, IonButton,  CommonModule, FormsModule, RouterLink,]
})
export class HomePage implements OnInit {
  
  userName: string = ''; 
  private menuCtrl = inject(MenuController);
  // Inyectamos el servicio auth
  private authService = inject(AuthService);

  constructor() {
    addIcons({ 
      menuOutline, 
      personOutline, 
      shieldCheckmarkOutline, 
      alertCircleOutline, 
      add
    });
  }

  ngOnInit() {
    // Usamos la siguiente funcion
    const user = this.authService.getCurrentUser();
    if(user) {
      this.userName = user.name;
    } else {
      this.userName = 'Invitado'
    }
  }

  openMenu() {
    this.menuCtrl.open('main-menu');
  }
}