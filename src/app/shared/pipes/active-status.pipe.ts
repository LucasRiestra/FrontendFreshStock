import { Pipe, PipeTransform } from '@angular/core';

/**
 * Transforma un valor booleano en un texto de estado.
 *
 * Uso básico:
 *   {{ producto.activo | activeStatus }}
 *   // true  → 'Activo'
 *   // false → 'Inactivo'
 *
 * Con textos personalizados:
 *   {{ usuario.activo | activeStatus:'Habilitado':'Deshabilitado' }}
 *   // true  → 'Habilitado'
 *   // false → 'Deshabilitado'
 */
@Pipe({
  name: 'activeStatus',
  standalone: true
})
export class ActiveStatusPipe implements PipeTransform {

  transform(value: boolean, activeText: string = 'Activo', inactiveText: string = 'Inactivo'): string {
    return value ? activeText : inactiveText;
  }

}
