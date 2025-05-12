import { NgStyle } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'app-skeleton-image',
  imports: [
    NgStyle
  ],
  templateUrl: './skeletonImage.component.html',
  styleUrl: './skeleton-image.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SkeletonImageComponent {
  @Input() src!: string;
  @Input() alt: string = '';
  @Input() aspectRatio: string = '1:1';
  @Input() objectFit: 'cover' | 'contain' | 'fill' = 'contain';

  imagenCargada: boolean = false;
  paddingTop: string = '100%';

  ngOnInit() {
    this.setPaddingTop();
  }

  setPaddingTop() {
    const [width, height] = this.aspectRatio.split(':').map(Number);
    this.paddingTop = `${(height / width) * 100}%`;
  }

  onImagenCargada() {
    this.imagenCargada = true;
  }
}