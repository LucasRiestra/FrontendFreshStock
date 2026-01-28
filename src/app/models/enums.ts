export enum RolUsuario {
  Admin = 1,
  Gerente = 2,
  Empleado = 3
}

export enum EstadoInventario {
  EnProgreso = 1,
  Completado = 2,
  Cancelado = 3
}

export enum EstadoStock {
  Critico = 1,
  Bajo = 2,
  Normal = 3,
  Exceso = 4
}

export enum TipoAlerta {
  StockBajo = 1,
  StockCritico = 2,
  ProximoCaducar = 3,
  SinStock = 4
}
