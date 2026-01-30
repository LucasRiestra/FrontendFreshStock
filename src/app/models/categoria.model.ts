export interface Categoria {
  id: number;
  nombre: string;
}

export interface CreateCategoria {
  nombre: string;
  restauranteIds?: number[];  // Si es null o vacío, la categoría es global
}

export interface UpdateCategoria {
  nombre: string;
  restauranteIds?: number[];
}
