export interface Categoria {
  id: number;
  nombre: string;
}

export interface CreateCategoria {
  nombre: string;
  restauranteIds?: number[];
}

export interface UpdateCategoria {
  nombre: string;
  restauranteIds?: number[];
}
