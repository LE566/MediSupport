import { Component, signal, HostListener, ViewChild } from '@angular/core';
import { 
  IonContent, IonItem, IonInput, IonButton, IonIcon,
  IonModal } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  mailOutline, lockClosedOutline, personOutline, medkitOutline, 
  idCardOutline, peopleOutline, chevronDownOutline, checkmarkCircle 
} from 'ionicons/icons';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.page.html',
  styleUrls: ['./auth.page.scss'],
  standalone: true,
  imports: [
    IonContent, IonInput, IonButton, IonIcon, 
    IonModal
  ] 
})
export class AuthPage {
  @ViewChild(IonContent, { static: false }) content!: IonContent;

  // Controla Login/Registro
  isLoginMode = signal<boolean>(true);
  
  // Controla el Rol seleccionado
  userRole = signal<'patient' | 'doctor'>('patient');

  // Controla si el modal está abierto o cerrado
  isRoleModalOpen = signal<boolean>(false);

  constructor() {
    addIcons({ 
      medkitOutline, mailOutline, lockClosedOutline, personOutline, 
      idCardOutline, peopleOutline, chevronDownOutline, checkmarkCircle 
    });
  }

  toggleAuthMode() {
    this.isLoginMode.update(mode => !mode);
  }

  openRoleModal() {
    this.isRoleModalOpen.set(true);
  }

  selectRole(role: 'patient' | 'doctor') {
    this.userRole.set(role);
    this.isRoleModalOpen.set(false);
  }

  @HostListener('window:focusout', ['$event'])
  onFocusOut(event: any) {
    setTimeout(() => {
      const activeElement = document.activeElement;
      const isInput = activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA' || activeElement.closest('ion-input'));
      
      if (!isInput) {
        window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
        
        document.body.scrollTop = 0;
        document.documentElement.scrollTop = 0;
        
        document.body.scrollIntoView({ behavior: 'smooth', block: 'start' });

        setTimeout(() => {
          window.scrollTo(0, 0);
          document.body.scrollIntoView({ block: 'start' });
        }, 300);
      }
    }, 150);
  }
}