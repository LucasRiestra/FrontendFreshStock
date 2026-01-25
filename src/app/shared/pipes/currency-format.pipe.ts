import { Pipe, PipeTransform } from '@angular/core';

/**
 * Formatea un número como moneda.
 *
 * Uso básico (default: USD con 2 decimales):
 *   {{ 1234.5 | currencyFormat }}
 *   // → '$1,234.50'
 *
 * Con símbolo personalizado:
 *   {{ 1234.5 | currencyFormat:'€' }}
 *   // → '€1,234.50'
 *
 * Con decimales personalizados:
 *   {{ 1234.5 | currencyFormat:'$':0 }}
 *   // → '$1,235'
 *
 * Símbolo al final:
 *   {{ 1234.5 | currencyFormat:'€':2:false }}
 *   // → '1,234.50€'
 */
@Pipe({
  name: 'currencyFormat',
  standalone: true
})
export class CurrencyFormatPipe implements PipeTransform {

  transform(
    value: number | null | undefined,
    symbol: string = '$',
    decimals: number = 2,
    symbolFirst: boolean = true
  ): string {
    // Manejar valores nulos o undefined
    if (value === null || value === undefined) {
      return symbolFirst ? `${symbol}0.00` : `0.00${symbol}`;
    }

    // Formatear el número con separadores de miles y decimales
    const formattedNumber = value.toLocaleString('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    });

    // Retornar con el símbolo en la posición correcta
    return symbolFirst ? `${symbol}${formattedNumber}` : `${formattedNumber}${symbol}`;
  }

}
