export interface CategoriaResp {
    data: Categoria[];
}

export interface Categoria {
    _id:         string;
    descripcion: string;
    icono:       string;
}
