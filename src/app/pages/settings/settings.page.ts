import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent, IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton,
  IonIcon, IonItem, IonLabel, IonToggle, ToastController, AlertController
} from '@ionic/angular/standalone';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { addIcons } from 'ionicons';
import { 
  colorPaletteOutline, moonOutline, textOutline, chevronForwardOutline,
  calendarOutline, syncOutline, notificationsOutline, lockClosedOutline,
  downloadOutline, trashOutline, refreshOutline, informationCircleOutline,
  medicalOutline, heartOutline, checkmarkCircleOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    IonContent, IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton,
    IonIcon, IonItem, IonLabel, IonToggle
  ]
})
export class SettingsPage implements OnInit {
  
  // Preferencias
  darkMode = false;
  syncCalendar = true;
  textSize: 'small' | 'medium' | 'large' = 'medium';
  reminderTime: '15m' | '1h' | '1d' = '1h';

  constructor(
    private toastCtrl: ToastController,
    private alertCtrl: AlertController // Usamos el nativo de Ionic
  ) {
    addIcons({
      colorPaletteOutline, moonOutline, textOutline, chevronForwardOutline,
      calendarOutline, syncOutline, notificationsOutline, lockClosedOutline,
      downloadOutline, trashOutline, refreshOutline, informationCircleOutline,
      medicalOutline, heartOutline, checkmarkCircleOutline
    });
  }

  get textSizeLabel(): string {
    const labels = { small: 'Small', medium: 'Medium', large: 'Large' };
    return labels[this.textSize];
  }

  get reminderTimeLabel(): string {
    const labels = { '15m': '15 minutes before', '1h': '1 hour before', '1d': '1 day before' };
    return labels[this.reminderTime];
  }

  ngOnInit() {
    this.darkMode = localStorage.getItem('medisupport_dark_mode') === 'true';
    this.textSize = (localStorage.getItem('medisupport_text_size') as any) || 'medium';
    this.syncCalendar = localStorage.getItem('medisupport_sync') !== 'false';
    this.reminderTime = (localStorage.getItem('medisupport_reminder') as any) || '1h';

    this.applyDarkMode();
    this.applyTextSize();
  }

  async toggleDarkMode() {
    await Haptics.impact({ style: ImpactStyle.Light });
    localStorage.setItem('medisupport_dark_mode', String(this.darkMode));
    this.applyDarkMode();
  }

  private applyDarkMode() {
    document.body.classList.toggle('dark', this.darkMode);
    document.body.classList.toggle('light', !this.darkMode);
  }

  private applyTextSize() {
    document.body.classList.remove('text-small', 'text-medium', 'text-large');
    document.body.classList.add('text-' + this.textSize);
  }

  async savePreference(key: string, value: boolean) {
    await Haptics.impact({ style: ImpactStyle.Light });
    localStorage.setItem(key, String(value));
  }

  async changeTextSize() {
    await Haptics.impact({ style: ImpactStyle.Light });
    const alert = await this.alertCtrl.create({
      header: 'Text Size',
      inputs: [
        { label: 'Small', type: 'radio', value: 'small', checked: this.textSize === 'small' },
        { label: 'Medium', type: 'radio', value: 'medium', checked: this.textSize === 'medium' },
        { label: 'Large', type: 'radio', value: 'large', checked: this.textSize === 'large' }
      ],
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        { 
          text: 'Apply', 
          handler: (value) => {
            if (value) {
              this.textSize = value;
              localStorage.setItem('medisupport_text_size', value);
              this.applyTextSize();
              this.showToast('Text size updated');
            }
          }
        }
      ]
    });
    await alert.present();
  }

  async changeReminderTime() {
    await Haptics.impact({ style: ImpactStyle.Light });
    const alert = await this.alertCtrl.create({
      header: 'Default Reminder',
      message: 'When should we notify you about an upcoming appointment?',
      inputs: [
        { label: '15 minutes before', type: 'radio', value: '15m', checked: this.reminderTime === '15m' },
        { label: '1 hour before', type: 'radio', value: '1h', checked: this.reminderTime === '1h' },
        { label: '1 day before', type: 'radio', value: '1d', checked: this.reminderTime === '1d' }
      ],
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        { 
          text: 'Save', 
          handler: (value) => {
            if (value) {
              this.reminderTime = value;
              localStorage.setItem('medisupport_reminder', value);
              this.showToast('Reminder preferences updated');
            }
          }
        }
      ]
    });
    await alert.present();
  }

  async exportData() {
    await Haptics.impact({ style: ImpactStyle.Medium });
    // Aquí iría la lógica real para generar un PDF o CSV de citas
    this.showToast('Preparing your medical records for download...');
  }

  async clearCache() {
    await Haptics.impact({ style: ImpactStyle.Light });
    const alert = await this.alertCtrl.create({
      header: 'Clear Cache',
      message: 'This will remove cached app data. Your appointments and settings will be preserved.',
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        { 
          text: 'Clear Cache',
          role: 'destructive',
          handler: () => {
            sessionStorage.clear();
            this.showToast('Cache cleared successfully');
          }
        }
      ]
    });
    await alert.present();
  }

  async resetSettings() {
    await Haptics.impact({ style: ImpactStyle.Heavy });
    const alert = await this.alertCtrl.create({
      header: 'Reset Settings',
      message: 'Restore all settings to their default values?',
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        { 
          text: 'Reset All',
          role: 'destructive',
          handler: () => {
            this.darkMode = false;
            this.textSize = 'medium';
            this.syncCalendar = true;
            this.reminderTime = '1h';

            localStorage.removeItem('medisupport_dark_mode');
            localStorage.removeItem('medisupport_text_size');
            localStorage.removeItem('medisupport_sync');
            localStorage.removeItem('medisupport_reminder');

            this.applyDarkMode();
            this.applyTextSize();
            this.showToast('All settings restored to defaults');
          }
        }
      ]
    });
    await alert.present();
  }

  async showAbout() {
    await Haptics.impact({ style: ImpactStyle.Light });
    const alert = await this.alertCtrl.create({
      header: 'MediSupport+',
      subHeader: 'Manage your health easily',
      message: 'MediSupport+ helps you keep track of your medical appointments and history efficiently.',
      buttons: ['Awesome!']
    });
    await alert.present();
  }

  async showToast(msg: string) {
    const toast = await this.toastCtrl.create({
      message: msg,
      duration: 2000,
      position: 'bottom',
      icon: 'checkmark-circle-outline',
      color: 'dark'
    });
    toast.present();
  }
}