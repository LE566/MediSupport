import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonIcon, IonButton, } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons'; 
import { 
  menuOutline, 
      personOutline, 
      shieldCheckmarkOutline, 
      alertCircleOutline, 
      add
} from 'ionicons/icons';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [IonContent, IonIcon, IonButton,  CommonModule, FormsModule]
})
export class HomePage implements OnInit {
  
  userName: string = 'Paulina Muñoz'; 

  constructor() {
    addIcons({ 
      menuOutline, 
      personOutline, 
      shieldCheckmarkOutline, 
      alertCircleOutline, 
      add
    });
  }

  ngOnInit() {}
}