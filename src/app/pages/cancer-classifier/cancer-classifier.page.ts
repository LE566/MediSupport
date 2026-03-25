import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { 
  IonContent, IonHeader, IonTitle, IonToolbar, IonButton,
  IonIcon, IonButtons, IonSpinner, IonItem,
  IonInput, IonSelect, IonSelectOption, IonTextarea, IonBackButton 
} from '@ionic/angular/standalone';
import { ToastController, LoadingController } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { 
  cloudUploadOutline, imageOutline, barChartOutline, timeOutline,
  warningOutline, analyticsOutline, medicalOutline, documentTextOutline,
  personOutline, calendarOutline, idCardOutline, bodyOutline,
  arrowBackOutline, arrowForwardOutline, image, person, barChart,
  helpCircleOutline, checkmarkCircleOutline, alertCircleOutline
} from 'ionicons/icons';

import { CancerClassifierService, AnalysisResponse } from '../../services/cancer-classifier.service';
import { AuthService } from '../../services/auth.service';

interface AnalysisResult {
  classification: 'Benign' | 'Malignant' | 'Benigno' | 'Maligno' | null;
  confidence: number;
}

interface HistoryItem {
  image: string;
  patientName: string;
  patientAge: number;
  patientId: string;
  breastSide: string;
  clinicalNotes: string;
  date: Date;
  classification: 'Benign' | 'Malignant' | 'Benigno' | 'Maligno';
  confidence: number;
}

interface PatientData {
  name: string;
  age: number | null;
  id: string;
  breastSide: string;
  clinicalNotes: string;
}

@Component({
  selector: 'app-cancer-classifier',
  templateUrl: './cancer-classifier.page.html',
  styleUrls: ['./cancer-classifier.page.scss'],
  standalone: true,
  imports: [
    IonBackButton, IonContent, IonHeader, IonTitle, IonToolbar, 
    IonButton, IonIcon, IonSpinner, IonItem, IonInput, 
    IonSelect, IonSelectOption, IonTextarea, CommonModule, FormsModule, IonButtons
  ]
})
export class CancerClassifierPage implements OnInit {
  selectedImage: File | null = null;
  imagePreview: string | null = null;
  isDragOver = false;
  analyzing = false;
  result: AnalysisResult | null = null;
  history: HistoryItem[] = [];
  serverAvailable = true;
  isPatient = false; // Variable para saber si es paciente

  patientData: PatientData = {
    name: '', age: null, id: '', breastSide: '', clinicalNotes: ''
  };

  showPatientForm = true;
  showImageSection = false;
  showResults = false;

  breastSides = [
    { value: 'Right Breast', label: 'Right Breast' },
    { value: 'Left Breast', label: 'Left Breast' }
  ];

  constructor(
    private cancerClassifierService: CancerClassifierService,
    private toastController: ToastController,
    private loadingController: LoadingController,
    private router: Router,
    private authService: AuthService
  ) {
    addIcons({ 
      cloudUploadOutline, imageOutline, barChartOutline, timeOutline,
      warningOutline, analyticsOutline, medicalOutline, documentTextOutline,
      personOutline, calendarOutline, idCardOutline, bodyOutline,
      arrowBackOutline, arrowForwardOutline, image, person, barChart,
      helpCircleOutline, checkmarkCircleOutline, alertCircleOutline
    });
  }

  async ngOnInit() {
    await this.checkServerAvailability();
    await this.loadHistoryFromDatabase();

    // Verificamos si el usuario actual es un paciente
    const user = this.authService.getCurrentUser();
    if (user && (user.role === 'patient' || user.role === 'paciente')) {
      this.isPatient = true;
    }
  }

  async checkServerAvailability() {
    try {
      const response: any = await this.cancerClassifierService.checkServerHealth().toPromise();
      this.serverAvailable = response && response.status === 'healthy';
    } catch (error) {
      this.serverAvailable = false;
    }
  }

  async loadHistoryFromDatabase() {
    try {
      const predictions = await this.cancerClassifierService.getPredictions().toPromise();
      if (predictions && predictions.length > 0) {
        this.history = predictions.map((prediction: any) => ({
          image: prediction.image_url,
          patientName: prediction.patient_name,
          patientAge: prediction.patient_age,
          patientId: prediction.patient_id,
          breastSide: prediction.breast_side,
          clinicalNotes: prediction.clinical_notes,
          date: new Date(prediction.analysis_date),
          classification: prediction.classification,
          confidence: prediction.confidence
        }));
      } else {
        this.history = [];
      }
    } catch (error) {
      console.error('Error loading history:', error);
      this.history = [];
    }
  }

  isPatientDataValid(): boolean {
    return this.patientData.name.trim() !== '' && 
           this.patientData.age !== null && 
           this.patientData.age > 0 && 
           this.patientData.id.trim() !== '' &&
           this.patientData.breastSide !== '';
  }

  continueToImageUpload() {
    if (this.isPatientDataValid()) {
      this.showPatientForm = false;
      this.showImageSection = true;
      this.showResults = false;
    } else {
      this.showToast('Please fill in all required fields', 'warning');
    }
  }

  backToPatientForm() {
    this.showPatientForm = true;
    this.showImageSection = false;
    this.showResults = false;
  }

  selectImage() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.png';
    input.onchange = (event: any) => {
      const file = event.target.files[0];
      if (file) this.handleImage(file);
    };
    input.click();
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    this.isDragOver = false;
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    this.isDragOver = false;
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) this.handleImage(files[0]);
  }

  handleImage(file: File) {
    if (file.type !== 'image/png') {
      this.showToast('Only PNG files are allowed', 'danger');
      return;
    }
    this.selectedImage = file;
    this.result = null;

    const reader = new FileReader();
    reader.onload = () => { this.imagePreview = reader.result as string; };
    reader.readAsDataURL(file);
  }

  async analyzeImage() {
    if (!this.selectedImage) return;

    this.analyzing = true;
    this.result = null;

    const loading = await this.loadingController.create({
      message: 'Analyzing mammogram with AI...',
      spinner: 'crescent',
      duration: 30000
    });
    await loading.present();

    try {
      if (!this.serverAvailable) {
        throw new Error('AI Models are currently unavailable on the server. Evaluation is disabled.');
      }

      const cloudinaryUrl = await this.cancerClassifierService.uploadImageToCloudinary(this.selectedImage);
      const response: any = await this.cancerClassifierService.analyzeImage(
        cloudinaryUrl, 
        this.patientData
      ).toPromise();
      
      if (response && response.success) {
        this.result = {
          classification: response.classification,
          confidence: response.confidence_percent
        };

        const historyItem: HistoryItem = {
          image: cloudinaryUrl,
          patientName: this.patientData.name,
          patientAge: this.patientData.age!,
          patientId: this.patientData.id,
          breastSide: this.patientData.breastSide,
          clinicalNotes: this.patientData.clinicalNotes,
          date: new Date(),
          classification: response.classification,
          confidence: response.confidence_percent
        };

        this.history.unshift(historyItem);
        this.showResults = true;
        this.showImageSection = false;
      } else {
        throw new Error('Valid response not received from server');
      }
    } catch (error: any) {
      console.error('Analysis error:', error);
      let errorMessage = 'Ocurrió un error inesperado al analizar la imagen.';
      
      if (error.error && error.error.error) {
        errorMessage = error.error.error; 
      } else if (error.message) {
        errorMessage = error.message;
      }

      this.showToast(errorMessage, 'danger');
    } finally {
      this.analyzing = false;
      await loading.dismiss();
    }
  }

  newAnalysis() {
    this.selectedImage = null;
    this.imagePreview = null;
    this.result = null;
    this.showPatientForm = true;
    this.showImageSection = false;
    this.showResults = false;
  }

  clearAll() {
    this.patientData = { name: '', age: null, id: '', breastSide: '', clinicalNotes: '' };
    this.newAnalysis();
  }

  getResultIcon(): string {
    if (!this.result) return 'help-circle-outline';
    return (this.result.classification === 'Benign' || this.result.classification === 'Benigno') 
      ? 'checkmark-circle-outline' 
      : 'alert-circle-outline';
  }

  getResultText(): string {
    if (!this.result) return 'Waiting...';
    return `Diagnosis: ${this.result.classification}`;
  }

  getResultDescription(): string {
    if (!this.result) return '';
    return (this.result.classification === 'Benign' || this.result.classification === 'Benigno') 
      ? 'No suspicious findings for malignancy were detected.' 
      : 'Suspicious findings requiring further evaluation were detected.';
  }

  getRecommendations(): string {
    if (!this.result) return '';

    if (this.result.classification === 'Benign' || this.result.classification === 'Benigno') {
      return `
        <p><strong>Benign findings:</strong></p>
        <ul>
          <li>Continue with regular medical follow-up</li>
          <li>Annual mammogram control according to protocol</li>
          <li>Monthly breast self-exam</li>
        </ul>
      `;
    } else {
      return `
        <p><strong>Suspicious findings:</strong></p>
        <ul>
          <li><strong>Further evaluation by a specialist is highly recommended</strong></li>
          <li>Urgent consultation with oncology/mastology</li>
          <li>Consider biopsy for diagnostic confirmation</li>
        </ul>
        <div class="important-note">Note: This is a preliminary AI result. Final interpretation must be performed by a certified radiologist.</div>
      `;
    }
  }

  goToAppointments() {
    this.router.navigate(['/appointmentsPatient']);
  }

  private async showToast(message: string, color: 'success' | 'danger' | 'warning' = 'success') {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      color,
      position: 'bottom',
      buttons: [{ text: 'OK', role: 'cancel' }]
    });
    await toast.present();
  }
}