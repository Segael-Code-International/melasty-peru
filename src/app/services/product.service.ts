import { Injectable, inject, PLATFORM_ID, TransferState, makeStateKey } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, tap, catchError, timer, switchMap, shareReplay, map } from 'rxjs';
import { Producto, ProductoSlugResp } from '../interfaces/producto.interfaces';
import { environment } from '../../environments/environment';
import { isPlatformBrowser, isPlatformServer } from '@angular/common';
import { Categoria, CategoriaResp } from '../interfaces';

// Definimos claves para TransferState
const PRODUCTOS_KEY = makeStateKey<Record<string, Producto[]>>('productos');
const CATEGORIAS_KEY = makeStateKey<CategoriaResp>('categorias');
const LAST_UPDATE_KEY = makeStateKey<Record<string, number>>('lastUpdate');

interface ProductosResponse {
  data: Producto[];
}

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private http = inject(HttpClient);
  private transferState = inject(TransferState);
  private platformId = inject(PLATFORM_ID);

  private apiUrl = environment.url;
  private refreshInterval = 5 * 60 * 1000; // 5 minutos
  
  // Cache en memoria para el cliente
  private productosCache: Record<string, { data: Producto[], timestamp: number }> = {};
  private categoriasCache: { data: Categoria[], timestamp: number } | null = null;

  obtener_productos(id_marca: string): Observable<ProductosResponse> {
    // Si estamos en el navegador
    if (isPlatformBrowser(this.platformId)) {
      // Primera carga: intentar obtener datos del TransferState
      const stateProductos = this.transferState.get<Record<string, Producto[]>>(PRODUCTOS_KEY, {});
      const lastUpdates = this.transferState.get<Record<string, number>>(LAST_UPDATE_KEY, {});
      
      if (stateProductos[id_marca]) {
        // Guardar en caché del cliente al cargar la página
        if (!this.productosCache[id_marca]) {
          this.productosCache[id_marca] = { 
            data: stateProductos[id_marca], 
            timestamp: lastUpdates[id_marca] || Date.now() 
          };
        }
        
        // Comprobar si han pasado más de 5 minutos desde la última actualización
        const ahora = Date.now();
        const ultimaActualizacion = this.productosCache[id_marca]?.timestamp || 0;
        
        if (ahora - ultimaActualizacion > this.refreshInterval) {
          // Actualizar en segundo plano
          this.actualizarProductosEnSegundoPlano(id_marca);
        }
        
        // Devolver datos de la caché inmediatamente
        return of({ data: this.productosCache[id_marca].data });
      }
      
      // Si no hay datos en TransferState o caché, hacer petición y cachear
      return this.http.get<ProductosResponse>(`${this.apiUrl}eprovet/obtener-productos/${id_marca}`).pipe(
        tap(res => {
          this.productosCache[id_marca] = { 
            data: res.data, 
            timestamp: Date.now() 
          };
        }),
        catchError(error => {
          console.error('Error obteniendo productos:', error);
          return of({ data: [] });
        })
      );
    }
    
    // Si estamos en el servidor, hacer la petición HTTP
    return this.http.get<ProductosResponse>(`${this.apiUrl}eprovet/obtener-productos/${id_marca}`).pipe(
      tap(res => {
        // Almacenar en TransferState para transferir al cliente
        const currentState = this.transferState.get<Record<string, Producto[]>>(PRODUCTOS_KEY, {});
        const currentTimestamps = this.transferState.get<Record<string, number>>(LAST_UPDATE_KEY, {});
        
        const newState = { ...currentState, [id_marca]: res.data };
        const newTimestamps = { ...currentTimestamps, [id_marca]: Date.now() };
        
        this.transferState.set(PRODUCTOS_KEY, newState);
        this.transferState.set(LAST_UPDATE_KEY, newTimestamps);
      }),
      catchError(error => {
        console.error('Error obteniendo productos:', error);
        return of({ data: [] });
      })
    );
  }

  private actualizarProductosEnSegundoPlano(id_marca: string): void {
    if (isPlatformBrowser(this.platformId)) {
      this.http.get<ProductosResponse>(`${this.apiUrl}eprovet/obtener-productos/${id_marca}`).subscribe({
        next: (res) => {
          // Actualizar caché
          this.productosCache[id_marca] = { 
            data: res.data, 
            timestamp: Date.now() 
          };
          console.log('Productos actualizados en segundo plano');
        },
        error: (err) => console.error('Error actualizando productos en segundo plano:', err)
      });
    }
  }

  obtener_producto_por_slug(slug: string): Observable<ProductoSlugResp> {
    // En el cliente, buscar primero en las cachés
    if (isPlatformBrowser(this.platformId)) {
      // Revisar si el producto está en alguna de las listas cacheadas
      for (const key in this.productosCache) {
        const productos = this.productosCache[key].data;
        const producto = productos.find(p => p.slug === slug);
        if (producto) {
          // Actualizar en segundo plano si han pasado más de 5 minutos
          const ahora = Date.now();
          const ultimaActualizacion = this.productosCache[key].timestamp;
          
          if (ahora - ultimaActualizacion > this.refreshInterval) {
            this.actualizarProductoPorSlugEnSegundoPlano(slug);
          }
          
          // Devolvemos el producto en el formato ProductoSlugResp
          const response: ProductoSlugResp = {
            correcto: true,
            message: 'Producto encontrado en cache',
            data: producto
          };
          return of(response);
        }
      }
    }
    
    // Buscar en TransferState
    const stateProductos = this.transferState.get<Record<string, Producto[]>>(PRODUCTOS_KEY, {});

    // Revisar si el producto está en alguna de las listas en TransferState
    for (const productos of Object.values(stateProductos)) {
      const producto = productos.find(p => p.slug === slug);
      if (producto) {
        // Devolvemos el producto en el formato ProductoSlugResp
        const response: ProductoSlugResp = {
          correcto: true,
          message: 'Producto encontrado en cache',
          data: producto
        };
        return of(response);
      }
    }

    // Si no lo encontramos, hacer la petición HTTP
    return this.http.get<ProductoSlugResp>(`${this.apiUrl}eprovet/obtener-producto-slug/${slug}`).pipe(
      tap(res => {
        // No guardamos productos individuales en el TransferState por ahora
      }),
      catchError(error => {
        console.error('Error obteniendo producto:', error);
        // Devolvemos un objeto con estructura correcta pero indicando el error
        return of({
          correcto: false,
          message: 'Error al obtener el producto',
          data: null as unknown as Producto // Forzamos el tipo para cumplir con la interfaz
        });
      })
    );
  }
  
  private actualizarProductoPorSlugEnSegundoPlano(slug: string): void {
    if (isPlatformBrowser(this.platformId)) {
      this.http.get<ProductoSlugResp>(`${this.apiUrl}eprovet/obtener-producto-slug/${slug}`).subscribe({
        next: (res) => {
          // Actualizamos el producto en todas las cachés existentes si es necesario
          for (const key in this.productosCache) {
            const index = this.productosCache[key].data.findIndex(p => p.slug === slug);
            if (index !== -1 && res.correcto) {
              this.productosCache[key].data[index] = res.data;
              this.productosCache[key].timestamp = Date.now();
              console.log('Producto actualizado en segundo plano');
            }
          }
        },
        error: (err) => console.error('Error actualizando producto en segundo plano:', err)
      });
    }
  }

  obtener_categorias(id_marca: string): Observable<CategoriaResp> {
    // Si estamos en el navegador
    if (isPlatformBrowser(this.platformId)) {
      // Primera carga: intentar obtener datos del TransferState
      const stateCategrias = this.transferState.get<CategoriaResp>(CATEGORIAS_KEY, { data: [] });
      
      if (stateCategrias.data.length > 0) {
        // Guardar en caché del cliente al cargar la página
        if (!this.categoriasCache) {
          this.categoriasCache = { 
            data: stateCategrias.data, 
            timestamp: Date.now() 
          };
        }
        
        // Comprobar si han pasado más de 5 minutos desde la última actualización
        const ahora = Date.now();
        const ultimaActualizacion = this.categoriasCache?.timestamp || 0;
        
        if (ahora - ultimaActualizacion > this.refreshInterval) {
          // Actualizar en segundo plano
          this.actualizarCategoriasEnSegundoPlano(id_marca);
        }
        
        // Devolver datos de la caché inmediatamente
        return of({ data: this.categoriasCache.data });
      }
      
      // Si no hay datos en TransferState o caché, hacer petición y cachear
      return this.http.get<CategoriaResp>(`${this.apiUrl}eprovet/obtener-categorias/${id_marca}`).pipe(
        tap(res => {
          this.categoriasCache = { 
            data: res.data, 
            timestamp: Date.now() 
          };
        }),
        catchError(error => {
          console.error('Error obteniendo categorías:', error);
          return of({ data: [] });
        })
      );
    }

    // Si estamos en el servidor, hacer la petición HTTP
    return this.http.get<CategoriaResp>(`${this.apiUrl}eprovet/obtener-categorias/${id_marca}`).pipe(
      tap(res => {
        // Almacenar en TransferState para transferir al cliente
        this.transferState.set(CATEGORIAS_KEY, res);
      }),
      catchError(error => {
        console.error('Error obteniendo categorías:', error);
        return of({ data: [] });
      })
    );
  }

  private actualizarCategoriasEnSegundoPlano(id_marca: string): void {
    if (isPlatformBrowser(this.platformId)) {
      this.http.get<CategoriaResp>(`${this.apiUrl}eprovet/obtener-categorias/${id_marca}`).subscribe({
        next: (res) => {
          // Actualizar caché
          this.categoriasCache = { 
            data: res.data, 
            timestamp: Date.now() 
          };
          console.log('Categorías actualizadas en segundo plano');
        },
        error: (err) => console.error('Error actualizando categorías en segundo plano:', err)
      });
    }
  }
  
  // Método para forzar una recarga desde el cliente
  forzarActualizacion(id_marca: string): Observable<{ productos: ProductosResponse, categorias: CategoriaResp }> {
    return this.http.get<ProductosResponse>(`${this.apiUrl}eprovet/obtener-productos/${id_marca}`).pipe(
      switchMap(productosRes => {
        // Actualizar caché de productos
        this.productosCache[id_marca] = { 
          data: productosRes.data, 
          timestamp: Date.now() 
        };
        
        // Obtener categorías 
        return this.http.get<CategoriaResp>(`${this.apiUrl}eprovet/obtener-categorias/${id_marca}`).pipe(
          map(categoriasRes => {
            // Actualizar caché de categorías
            this.categoriasCache = { 
              data: categoriasRes.data, 
              timestamp: Date.now() 
            };
            
            return {
              productos: productosRes,
              categorias: categoriasRes
            };
          })
        );
      }),
      catchError(error => {
        console.error('Error forzando actualización:', error);
        return of({
          productos: { data: this.productosCache[id_marca]?.data || [] },
          categorias: { data: this.categoriasCache?.data || [] }
        });
      })
    );
  }
}