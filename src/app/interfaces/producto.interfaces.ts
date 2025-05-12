export interface ProductoResp {
    correcto: boolean;
    message:  string;
    data:     Producto[];
}

export interface ProductoSlugResp {
    correcto: boolean;
    message:  string;
    data:     Producto;
}

export interface Producto {
    _id:              string;
    codigo:           string;
    nombre:           string;
    descripcion:      string;
    precio:           number;
    unidad_medida:    string;
    limite_cm:        number;
    limite_ms:        number;
    garantia:         number;
    estado:           number;
    galeria:          string[];
    caracteristica:   any[];
    id_usuario:       string;
    id_categoria:     string;
    id_marca:         string;
    createdAt:        Date;
    __v:              number;
    limite_sm:        string;
    slug:             string;
    vistas?:          number;
    url?:             string;
    ficha_tecnica?:   string;
    cantidad_vistas?: number;
}