import { ChangeDetectionStrategy, Component, Input, Output, EventEmitter } from '@angular/core';
import { PaginatorModule } from 'primeng/paginator';
import { PaginatorState } from 'primeng/paginator';

@Component({
  selector: 'app-pagination',
  imports: [PaginatorModule],
  templateUrl: './pagination.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaginationComponent {
  @Input() currentPage: number = 1;
  @Input() totalPages: number = 1;
  @Output() pageChange = new EventEmitter<number>();

  // Método que conserva tu lógica original para cambiar de página
  onPageChange(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.pageChange.emit(page);
    }
  }

  // Método para manejar el evento de cambio de página de PrimeNG
  onPageChangeEvent(event: PaginatorState): void {
    if (event.page !== undefined) {
      const newPage = event.page + 1;
      this.onPageChange(newPage);
    }
  }

  // Obtener el índice del primer elemento para PrimeNG
  get first(): number {
    return (this.currentPage - 1) * this.getRows();
  }

  // Obtener el número de filas para PrimeNG (simulado - podría ser un @Input)
  getRows(): number {
    return 10; // Valor predeterminado de filas por página
  }

  // Calcula el número total de registros basado en páginas totales
  get totalRecords(): number {
    return this.totalPages * this.getRows();
  }

  // Mantiene tu método original para obtener los números de página
  getPageNumbers(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  // Mantiene tu método original para obtener las páginas visibles
  getVisiblePageNumbers(): number[] {
    const maxVisiblePages = 5; // Número máximo de páginas visibles
    const halfMaxVisiblePages = Math.floor(maxVisiblePages / 2);

    if (this.totalPages <= maxVisiblePages) {
      return this.getPageNumbers();
    } else if (this.currentPage <= halfMaxVisiblePages) {
      return this.getPageNumbers().slice(0, maxVisiblePages);
    } else if (this.currentPage > this.totalPages - halfMaxVisiblePages) {
      return this.getPageNumbers().slice(-maxVisiblePages);
    } else {
      return [
        1,
        ...(this.getPageNumbers().slice(this.currentPage - halfMaxVisiblePages - 1, this.currentPage + halfMaxVisiblePages)),
        this.totalPages
      ];
    }
  }
}