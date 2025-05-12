
const id_marca = '671ac5cdc9c80b4d0388d787';
const apiUrl = 'https://api.workingprime.com/agp/';


( async () => {
  const fs = require('fs');

  //Por slug d eproductos
  const productsList = await fetch(`${apiUrl}eprovet/obtener-productos/${id_marca}`)
  .then( res => res.json() );

  let fileContent;

  fileContent += productsList.data.map(
    product => `/products/${product.slug}`
  ).join('\n');

  fs.writeFileSync('routes.txt', fileContent);
})();