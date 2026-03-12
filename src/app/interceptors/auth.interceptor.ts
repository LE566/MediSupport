import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();

  // 1. Excepción para Cloudinary: No enviamos el token de Python a servidores externos
  if (req.url.includes('cloudinary.com')) {
    return next(req);
  }

  // 2. Si tenemos un token, clonamos la petición y le pegamos el Header de Autorización
  if (token) {
    const clonedRequest = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    return next(clonedRequest);
  }

  // 3. Si no hay token o no es una ruta protegida, la petición sigue su curso normal
  return next(req);
};