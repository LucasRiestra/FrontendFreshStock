export interface RestauranteCategoria {
  id: number;
  restauranteId: number;
  categoriaId: number;
}

export interface CreateRestauranteCategoria {
  restauranteId: number;
  categoriaId: number;
}