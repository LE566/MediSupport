import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CloudinaryService {
  private http = inject(HttpClient);
 
  private cloudName = 'dzxpiut42'; 
  private uploadPreset = 'medisupport_perfiles'; 

  constructor() {}

  // Recibe un archivo y lo manda directo a Cloudinary
  uploadImage(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', this.uploadPreset);

    // URL oficial de la API de Cloudinary para subir imágenes
    const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${this.cloudName}/image/upload`;

    return this.http.post(cloudinaryUrl, formData);
  }
}