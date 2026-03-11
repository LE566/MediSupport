import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

export interface AnalysisResponse {
  success: boolean;
  classification: 'Benign' | 'Malignant';
  confidence_percent: number;
}

@Injectable({
  providedIn: 'root'
})
export class CancerClassifierService {

  constructor() { }

  checkServerHealth(): Observable<boolean> {
    return of(true).pipe(delay(500));
  }

  getPredictions(): Observable<any[]> {
    return of([]).pipe(delay(500));
  }

  async uploadImageToCloudinary(file: File): Promise<string> {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve('https://fake-cloudinary-url.com/demo-image.png');
      }, 1000);
    });
  }

  analyzeImage(cloudinaryUrl: string, patientData: any, imageFile: File): Observable<AnalysisResponse> {
    const isMalignant = Math.random() > 0.5; 
    
    const randomConfidence = Math.floor(Math.random() * (98 - 75 + 1) + 75);

    const mockResponse: AnalysisResponse = {
      success: true,
      classification: isMalignant ? 'Malignant' : 'Benign',
      confidence_percent: randomConfidence
    };
    
    return of(mockResponse).pipe(delay(2500));
  }
}