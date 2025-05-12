import { Pipe, type PipeTransform } from '@angular/core';

@Pipe({
  name: 'paginate',
})
export class PaginatePipe implements PipeTransform {
  transform(array: any[], page: number = 1, pageSize: number = 10): any[] {
    if (!array || !Array.isArray(array) || array.length === 0) {
      return [];
    }

    // Calculamos el índice inicial y final para la página actual
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;

    // Retornamos la porción del array correspondiente a la página actual
    return array.slice(startIndex, endIndex);
  }
}