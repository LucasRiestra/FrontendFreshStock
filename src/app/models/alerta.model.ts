import { TipoAlerta } from './enums';

export interface AlertaStockResponse {
  id: number;
  productoId: number;
  restauranteId: number;
  tipoAlerta: TipoAlerta;
  mensaje: string;
  stockActual?: number;
  stockMinimo?: number;
  fechaCaducidad?: Date;
  fechaCreacion: Date;
  leida: boolean;
  fechaLectura?: Date;
  usuarioLecturaId?: number;
  // Campos enriquecidos
  nombreProducto?: string;
  nombreRestaurante?: string;
}

export interface ResumenAlertas {
  restauranteId: number;
  totalAlertas: number;
  alertasSinStock: number;
  alertasStockCritico: number;
  alertasStockBajo: number;
  alertasProximoCaducar: number;
  alertasNoLeidas: number;
}

export interface MarcarAlertasLeidasDTO {
  alertaIds: number[];
}

export interface GeneracionAlertasResult {
  alertasGeneradas: number;
  alertasSinStock: number;
  alertasStockCritico: number;
  alertasStockBajo: number;
  alertasProximoCaducar: number;
  mensaje: string;
}
