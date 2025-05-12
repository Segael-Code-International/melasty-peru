// src/app/services/categoria-filter.service.ts

import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CategoriaFilterService {
  // BehaviorSubject para mantener las categorías seleccionadas
  private categoriaSeleccionadaSource = new BehaviorSubject<string[]>([]);
  
  // Observable público que otros componentes pueden suscribir
  categoriaSeleccionada$ = this.categoriaSeleccionadaSource.asObservable();
  
  constructor() { }
  
  /**
   * Establece una categoría seleccionada (reemplaza selecciones existentes)
   */
  setCategoria(id_categoria: string): void {
    this.categoriaSeleccionadaSource.next([id_categoria]);
  }
  
  /**
   * Establece múltiples categorías seleccionadas
   */
  setCategorias(ids_categoria: string[]): void {
    this.categoriaSeleccionadaSource.next(ids_categoria);
  }
  
  /**
   * Agrega una categoría a las seleccionadas (mantiene selecciones existentes)
   */
  addCategoria(id_categoria: string): void {
    const currentCategorias = this.categoriaSeleccionadaSource.value;
    if (!currentCategorias.includes(id_categoria)) {
      this.categoriaSeleccionadaSource.next([...currentCategorias, id_categoria]);
    }
  }
  
  /**
   * Limpia todas las categorías seleccionadas
   */
  clearCategorias(): void {
    this.categoriaSeleccionadaSource.next([]);
  }
  
  /**
   * Obtiene el valor actual de categorías seleccionadas
   */
  getCurrentCategorias(): string[] {
    return this.categoriaSeleccionadaSource.value;
  }
}