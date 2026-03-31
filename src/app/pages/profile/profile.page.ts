import { Component, OnInit, inject, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, 
  IonBackButton, IonButton, IonIcon, IonItem, IonInput, 
  IonLabel, IonToggle, ToastController, LoadingController 
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  closeOutline, createOutline, camera, shieldCheckmarkOutline, 
  personOutline, mailOutline, fingerPrintOutline, notificationsOutline, 
  settingsOutline, documentTextOutline, chevronForwardOutline, 
  saveOutline, logOutOutline 
} from 'ionicons/icons';
import { RouterLink } from '@angular/router';

// Servicios
import { AuthService } from '../../services/auth.service';
import { CloudinaryService } from '../../services/cloudinary.service';

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
  // Referencia al contenido para controlar el scroll
  @ViewChild(IonContent, { static: false }) content!: IonContent;
  
  // Inyección de servicios
  private authService = inject(AuthService);
  private cloudinaryService = inject(CloudinaryService);
  private toastCtrl = inject(ToastController);
  private loadingCtrl = inject(LoadingController);

  // Variables de estado
  isEditing: boolean = false;
  biometricsEnabled: boolean = true;
  notificationsEnabled: boolean = false;

  // Datos del usuario y gestión de imagen
  user: any = null;
  selectedFile: File | null = null;
  previewUrl: string | null = null;

  constructor() {
    addIcons({
      closeOutline, createOutline, camera, shieldCheckmarkOutline, 
      personOutline, mailOutline, fingerPrintOutline, notificationsOutline, 
      settingsOutline, documentTextOutline, chevronForwardOutline, 
      saveOutline, logOutOutline
    });
  }

  ngOnInit() {
    this.cargarDatosUsuario();
  }

  // Se ejecuta cada vez que la vista entra (resuelve el problema de caché y scroll)
  ionViewWillEnter() {
    this.cargarDatosUsuario();
    if (this.content) {
      this.content.scrollToTop(0);
    }
  }

  cargarDatosUsuario() {
    const userData = this.authService.getCurrentUser();
    
    if (userData) {
      this.user = {
        name: userData.name,
        email: userData.email,
        role: userData.role,
        avatarUrl: userData.avatarUrl || 'https://ionicframework.com/docs/img/demos/avatar.svg'
      };
      // Limpiamos rastro de ediciones previas
      this.previewUrl = null;
      this.selectedFile = null;
    }
  }

  toggleEdit() {
    this.isEditing = !this.isEditing;
    if (!this.isEditing) {
      this.selectedFile = null;
      this.previewUrl = null;
      this.cargarDatosUsuario();
    }
  }

  // Previsualización local de la imagen
  changeProfilePicture() {
    if (!this.isEditing) return;

    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/png, image/jpeg';
    
    input.onchange = (event: any) => {
      const file = event.target.files[0];
      if (file) {
        this.selectedFile = file;
        const reader = new FileReader();
        reader.onload = () => {
          this.previewUrl = reader.result as string;
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  }

  // Lógica principal de guardado
  async saveChanges() {
    const loading = await this.loadingCtrl.create({
      message: 'Saving changes...',
      spinner: 'crescent'
    });
    await loading.present();

    if (this.selectedFile) {
      // Caso A: Hay imagen nueva, subimos primero a Cloudinary
      this.cloudinaryService.uploadImage(this.selectedFile).subscribe({
        next: (res) => {
          this.finalizarGuardado(res.secure_url, loading);
        },
        error: () => {
          loading.dismiss();
          this.mostrarToast('Error uploading image to Cloudinary', 'danger');
        }
      });
    } else {
      // Caso B: No hay imagen nueva, solo actualizamos textos
      this.finalizarGuardado(this.user.avatarUrl, loading);
    }
  }

  private finalizarGuardado(avatarUrl: string, loading: any) {
    const datosActualizados = {
      name: this.user.name,
      email: this.user.email,
      avatarUrl: avatarUrl
    };

    this.authService.updateProfile(datosActualizados).subscribe({
      next: () => {
        // Actualizamos LocalStorage para persistencia inmediata en la app
        const currentUser = this.authService.getCurrentUser();
        if (currentUser) {
          Object.assign(currentUser, datosActualizados);
          localStorage.setItem('current_user', JSON.stringify(currentUser));
        }
        
        this.user.avatarUrl = avatarUrl;
        this.isEditing = false;
        this.selectedFile = null;
        this.previewUrl = null;
        
        loading.dismiss();
        this.mostrarToast('Profile updated successfully', 'success');
      },
      error: (err) => {
        loading.dismiss();
        this.mostrarToast('Error saving data in database', 'danger');
      }
    });
  }

  logout() {
    // Desenfocamos el botón para evitar errores de accesibilidad al navegar
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    this.authService.logout();
  }

  async mostrarToast(mensaje: string, color: string) {
    const toast = await this.toastCtrl.create({
      message: mensaje,
      duration: 2000,
      color: color,
      position: 'bottom'
    });
    await toast.present();
  }
}