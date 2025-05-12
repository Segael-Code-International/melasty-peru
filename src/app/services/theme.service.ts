import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private isDarkTheme = new BehaviorSubject<boolean>(false);
  isDarkTheme$ = this.isDarkTheme.asObservable();
  private readonly DARK_MODE_CLASS = 'my-app-dark';
  private isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);

    // Solo inicializa el tema si estamos en el navegador
    if (this.isBrowser) {
      this.isDarkTheme.next(this.getStoredThemePreference());
      this.initializeTheme();
    }
  }

  public getStoredThemePreference(): boolean {
    if (!this.isBrowser) return false;

    // Verifica el localStorage primero
    const storedPreference = localStorage.getItem('isDarkTheme');
    if (storedPreference !== null) {
      return JSON.parse(storedPreference);
    }

    // Si no hay preferencia guardada, verifica la preferencia del sistema
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  private initializeTheme() {
    if (!this.isBrowser) return;

    if (this.isDarkTheme.value) {
      document.documentElement.classList.add(this.DARK_MODE_CLASS);
    }
  }

  toggleTheme() {
    if (!this.isBrowser) return;

    const newThemeValue = !this.isDarkTheme.value;
    this.isDarkTheme.next(newThemeValue);
    localStorage.setItem('isDarkTheme', JSON.stringify(newThemeValue));

    document.documentElement.classList.toggle(this.DARK_MODE_CLASS);
  }
}