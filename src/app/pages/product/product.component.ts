import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Meta, Title } from '@angular/platform-browser';

// PrimeNG Components
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { GalleriaModule } from 'primeng/galleria';
import { TabViewModule } from 'primeng/tabview';
import { DividerModule } from 'primeng/divider';
import { TagModule } from 'primeng/tag';
import { ImageModule } from 'primeng/image';
import { SkeletonModule } from 'primeng/skeleton';
import { TooltipModule } from 'primeng/tooltip';
import { MessageModule } from 'primeng/message';

// Services and Models
import { Observable, catchError, map, of, switchMap, tap } from 'rxjs';
import { ProductService } from '../../services/product.service';
import { Producto, ProductoSlugResp } from '../../interfaces/producto.interfaces';

@Component({
  selector: 'app-product',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    CardModule,
    ButtonModule,
    GalleriaModule,
    TabViewModule,
    DividerModule,
    TagModule,
    ImageModule,
    SkeletonModule,
    TooltipModule,
    MessageModule
  ],
  templateUrl: './product.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ProductComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private productosService = inject(ProductService);
  private metaService = inject(Meta);
  private titleService = inject(Title);

  producto$: Observable<Producto | null> = of(null);
  loading = true;
  error = false;
  errorMessage: string = '';
  
  responsiveOptions = [
    {
      breakpoint: '1024px',
      numVisible: 5
    },
    {
      breakpoint: '768px',
      numVisible: 3
    },
    {
      breakpoint: '560px',
      numVisible: 1
    }
  ];

  ngOnInit(): void {
    this.producto$ = this.route.params.pipe(
      map(params => params['slug']),
      switchMap(slug => {
        this.loading = true;
        return this.productosService.obtener_producto_por_slug(slug).pipe(
          map((response: ProductoSlugResp) => {
            if (response.correcto) {
              return response.data;
            } else {
              this.error = true;
              this.errorMessage = response.message || 'Error al obtener el producto';
              return null;
            }
          }),
          tap(producto => {
            this.loading = false;
            if (producto) {
              this.updateMetaTags(producto);
            }
          }),
          catchError((error) => {
            this.loading = false;
            this.error = true;
            this.errorMessage = 'Error al cargar el producto. Por favor, inténtelo más tarde.';
            console.error('Error obteniendo producto:', error);
            return of(null);
          })
        );
      })
    );
  }

  private updateMetaTags(producto: Producto): void {
    // Título de la página
    this.titleService.setTitle(`${producto.nombre} - ${producto.codigo}`);
    
    // Meta tags para SEO
    this.metaService.updateTag({ name: 'description', content: producto.descripcion });
    this.metaService.updateTag({ property: 'og:title', content: producto.nombre });
    this.metaService.updateTag({ property: 'og:description', content: producto.descripcion });
    
    // Si hay imágenes disponibles, usar la primera para og:image
    if (producto.galeria && producto.galeria.length > 0) {
      this.metaService.updateTag({ property: 'og:image', content: producto.galeria[0] });
    }
    
    // Metadatos adicionales
    this.metaService.updateTag({ property: 'og:type', content: 'product' });
    this.metaService.updateTag({ name: 'keywords', content: `${producto.nombre}, ${producto.codigo}, ${producto.id_marca}, producto` });
    this.metaService.updateTag({ name: 'robots', content: 'index, follow' });
  }

  getEstadoTag(estado: number): { severity: string, value: string } {
    switch (estado) {
      case 1:
        return { severity: 'success', value: 'Disponible' };
      case 2:
        return { severity: 'warning', value: 'Limitado' };
      case 0:
        return { severity: 'danger', value: 'No disponible' };
      default:
        return { severity: 'info', value: 'Desconocido' };
    }
  }
}