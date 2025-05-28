import { ChangeDetectionStrategy, Component, inject, OnInit, signal, OnDestroy } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { Chip } from 'primeng/chip';
import { Meta, Title } from '@angular/platform-browser';
import { Categoria } from '../../interfaces/categoria.interface';
import { ProductService } from '../../services/product.service';
import { environment } from '../../../environments/environment';
import { CategoriaFilterService } from '../../services/categoria-filter.service';
import { Subscription, fromEvent, filter, interval, takeWhile } from 'rxjs';
import { isPlatformBrowser, SlicePipe } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';
import { Carousel } from 'primeng/carousel';
import { Producto } from '../../interfaces';

@Component({
  selector: 'app-home',
  imports: [
    ButtonModule,
    RouterLink,
    Chip,
    Carousel,
    SlicePipe
  ],
  providers: [ProductService],
  templateUrl: './home.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class HomeComponent implements OnInit, OnDestroy {

  private productService = inject(ProductService);
  private categoriaFilterService = inject(CategoriaFilterService);
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);

  categorias = signal<Categoria[]>([]);
  cargando = signal(false);
  id_marca = environment.idMarca;

  // Para la actualización automática
  private visibilitySubscription?: Subscription;
  private refreshInterval?: Subscription;
  private isVisible = true;
  private componentActive = true;

  products: Producto[] = [];
  responsiveOptions: any[] | undefined;

  constructor(
    private meta: Meta,
    private title: Title
  ) { }

  ngOnInit(): void {
    // Configura el título de la página
    this.title.setTitle('MELASTY Perú - Tecnología en genética, software y harware');

    // Configura las meta etiquetas para SEO
    this.meta.addTags([
      { name: 'description', content: 'MELASTY ofrece tecnología de vanguardia para optimizar operaciones agrícolas y ganaderas: picadoras, sistemas de ordeño y productos veterinarios de alta calidad.' },
      { name: 'keywords', content: 'tecnología agrícola, equipos ganaderos, picadoras, sistemas de ordeño, productos veterinarios, innovación agropecuaria, maquinaria agrícola' },
      { name: 'robots', content: 'index, follow' },
      { name: 'author', content: 'MELASTY' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { property: 'og:title', content: 'MELASTY - Tecnología Agrícola y Ganadera de Vanguardia' },
      { property: 'og:description', content: 'Transforma tu operación agrícola y ganadera con la vanguardia tecnológica de MELASTY.' },
      { property: 'og:type', content: 'website' },
      { property: 'og:url', content: 'https://melastyperu.com' },
      { property: 'og:image', content: 'https://melastyperu.com/logo.jpeg' },
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: 'MELASTY - Tecnología Agrícola y Ganadera de Vanguardia' },
      { name: 'twitter:description', content: 'Transforma tu operación agrícola y ganadera con la vanguardia tecnológica de MELASTY.' },
      { name: 'twitter:image', content: 'https://melastyperu.com/logo.jpeg' }
    ]);

    this.cargarCategorias();

    // Sólo configurar el seguimiento de visibilidad y actualizaciones en el navegador
    if (isPlatformBrowser(this.platformId)) {
      this.setupVisibilityTracking();
      this.setupRefreshInterval();
    }

    this.productService.obtener_productos(this.id_marca).subscribe(
      {
        next: (res) => {
          this.products = res.data.slice(0, 12);
        }
      }
    );

    this.responsiveOptions = [
      {
        breakpoint: '1400px',
        numVisible: 3,
        numScroll: 1
      },
      {
        breakpoint: '1199px',
        numVisible: 4,
        numScroll: 1
      },
      {
        breakpoint: '767px',
        numVisible: 2,
        numScroll: 1
      },
      {
        breakpoint: '575px',
        numVisible: 1,
        numScroll: 1
      }
    ]
  }

  ngOnDestroy(): void {
    this.componentActive = false;

    if (this.visibilitySubscription) {
      this.visibilitySubscription.unsubscribe();
    }

    if (this.refreshInterval) {
      this.refreshInterval.unsubscribe();
    }
  }

  private setupVisibilityTracking(): void {
    // Detectar cuando la página se vuelve visible/invisible
    this.visibilitySubscription = fromEvent(document, 'visibilitychange')
      .pipe(
        takeWhile(() => this.componentActive)
      )
      .subscribe(() => {
        this.isVisible = document.visibilityState === 'visible';

        // Si la página se vuelve visible después de estar oculta, verificar si se necesita actualizar
        if (this.isVisible) {
          this.verificarActualizacionNecesaria();
        }
      });
  }

  private setupRefreshInterval(): void {
    // Verificar cada 5 minutos si necesitamos actualizar los datos, pero solo si la página es visible
    this.refreshInterval = interval(5 * 60 * 1000)
      .pipe(
        filter(() => this.isVisible),
        takeWhile(() => this.componentActive)
      )
      .subscribe(() => {
        this.verificarActualizacionNecesaria();
      });
  }

  private verificarActualizacionNecesaria(): void {
    // Esta función podría optimizarse para no recargar siempre, sino solo después
    // de un tiempo mínimo desde la última carga
    this.cargarCategorias(true);
  }

  cargarCategorias(forzarActualizacion: boolean = false): void {
    this.cargando.set(true);

    if (forzarActualizacion && isPlatformBrowser(this.platformId)) {
      // Forzar actualización desde la API
      this.productService.forzarActualizacion(this.id_marca).subscribe({
        next: (res) => {
          if (res.categorias && res.categorias.data) {
            this.categorias.set(res.categorias.data);
          }
          this.cargando.set(false);
        },
        error: (err) => {
          console.error('Error forzando actualización:', err);
          this.cargando.set(false);
        }
      });
    } else {
      // Carga normal (usando caché si está disponible)
      this.productService.obtener_categorias(this.id_marca).subscribe({
        next: (res) => {
          this.categorias.set(res.data);
          this.cargando.set(false);
        },
        error: (err) => {
          this.categorias.set([]);
          this.cargando.set(false);
        }
      });
    }
  }

  selectCategoria(id_categoria: string): void {
    // Establecer la categoría seleccionada en el servicio compartido
    this.categoriaFilterService.setCategoria(id_categoria);

    // Navegar a la página de productos
    this.router.navigate(['/products'], {
      queryParams: { categoria: id_categoria }
    });
  }

  // Método para permitir actualización manual (puedes agregar un botón en el template)
  actualizarManualmente(): void {
    this.cargarCategorias(true);
  }
}