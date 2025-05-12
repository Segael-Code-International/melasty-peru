import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Title, Meta } from '@angular/platform-browser';

@Component({
  selector: 'app-about',
  imports: [CommonModule],
  templateUrl: './about.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class AboutComponent implements OnInit {
  constructor(
    private titleService: Title,
    private metaService: Meta
  ) {}

  ngOnInit(): void {
    // Configuración para SEO
    this.titleService.setTitle('Sobre Nosotros | MELASTY PERÚ - Soluciones Tecnológicas para Agricultura y Ganadería');
    
    this.metaService.addTags([
      { name: 'description', content: 'Conoce nuestra misión y visión en MELASTY PERÚ. Ofrecemos soluciones tecnológicas avanzadas para mejorar la productividad en agricultura y ganadería.' },
      { name: 'keywords', content: 'MELASTY PERÚ, agricultura, ganadería, tecnología agropecuaria, soluciones tecnológicas, misión, visión' },
      { name: 'robots', content: 'index, follow' },
      { property: 'og:title', content: 'Sobre Nosotros | MELASTY PERÚ' },
      { property: 'og:description', content: 'Soluciones tecnológicas avanzadas para agricultura y ganadería.' },
      { property: 'og:type', content: 'website' }
    ]);
  }
}