import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface AnalysisResponse {
  success: boolean;
  classification: 'Benign' | 'Malignant' | 'Benigno' | 'Maligno';
  confidence_percent: number;
}

@Injectable({
  providedIn: 'root'
})
export class CancerClassifierService {
  // Inyectamos el cliente HTTP para hacer peticiones
  private http = inject(HttpClient);
  
  // Tu URL base de Python
  private apiUrl = 'http://localhost:5000/api'; 

  // Tus credenciales de Cloudinary
  private cloudName = 'dzxpiut42'; 
  private uploadPreset = 'medisupport_perfiles'; // *Tip: Después podrías crear uno llamado 'medisupport_mamografias' en Cloudinary*

  constructor() { }

  // 1. Verifica si Python está vivo
  checkServerHealth(): Observable<any> {
    return this.http.get(`${this.apiUrl}/ai/health`);
  }

  // 2. Trae el historial de la base de datos
  getPredictions(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/ai/history`);
  }

  // 3. Sube la imagen a Cloudinary de verdad
  uploadImageToCloudinary(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', this.uploadPreset);

    const cloudinaryApiUrl = `https://api.cloudinary.com/v1_1/${this.cloudName}/image/upload`;

    return new Promise((resolve, reject) => {
      this.http.post(cloudinaryApiUrl, formData).subscribe({
        next: (res: any) => resolve(res.secure_url),
        error: (err) => reject(err)
      });
    });
  }

  // 4. Manda el link y los datos a Python para que el EfficientNet los analice
  analyzeImage(cloudinaryUrl: string, patientData: any): Observable<any> {
    const payload = {
      image_url: cloudinaryUrl,
      patient_data: patientData
    };
    return this.http.post(`${this.apiUrl}/ai/analyze`, payload);
  }
}