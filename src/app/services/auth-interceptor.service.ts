import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { UserService } from '../components/user/user.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private userService: UserService) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    try {
      // Get the auth token from the service
      const token = this.userService.accessToken;

    // console.log('Auth interceptor running for URL:', request.url);
    // console.log('Token available:', !!token);

      // Only add the token if it exists and the request doesn't already have it
      if (token && !request.headers.has('x-access-token')) {
        // console.log('Adding auth token to request');

        // Clone the request and add the new header
        const authReq = request.clone({
          headers: request.headers.set('x-access-token', token)
        });

        // Handle 401/403 errors which might indicate auth issues
        return next.handle(authReq).pipe(
          catchError((error: HttpErrorResponse) => {
            if (error.status === 401 || error.status === 403) {
              console.error('Authentication error:', error.status);
              // Clear invalid auth if we get auth errors
              this.userService.clearInvalidAuth();
            }
            return throwError(() => error);
          })
        );
      }

      if (!token) {
        // console.log('No token available to add to request');
      }

      if (request.headers.has('x-access-token')) {
        // console.log('Request already has auth token');
      }
    } catch (e) {
      console.error('Error in auth interceptor:', e);
    }

    // Pass on the original request if no token or already has token
    return next.handle(request);
  }
}
