// URL base de tu API en .NET (Puerto 10000 según tu Dockerfile)
const API_URL = 'https://restuarante.onrender.com';

let listaPlatillos = [];

document.addEventListener('DOMContentLoaded', () => {
  obtenerEmpresa();
  obtenerPromociones();
  obtenerCategorias();
  obtenerMenu();
});

// 1. Cargar datos generales de la empresa (/api/empresa)
async function obtenerEmpresa() {
  try {
    const response = await fetch(`${API_URL}/api/empresa`);
    if (!response.ok) throw new Error('Error al obtener información de la empresa');
    const data = await response.json();

    document.getElementById('empresa-nombre').textContent = data.nombre;
    document.getElementById('hero-titulo').textContent = data.nombre;
    document.getElementById('empresa-descripcion').textContent = data.descripcion;
    document.getElementById('empresa-ubicacion').textContent = data.ubicacion;
    document.getElementById('empresa-telefono').textContent = data.telefono;
    document.getElementById('empresa-horario').textContent = data.horarioAtencion;
  } catch (error) {
    console.error('Error cargando empresa:', error);
  }
}

// 2. Cargar promociones activas (/api/promociones)
async function obtenerPromociones() {
  const container = document.getElementById('promociones-container');
  try {
    const response = await fetch(`${API_URL}/api/promociones`);
    if (!response.ok) throw new Error('Error al obtener promociones');
    const promociones = await response.json();

    container.innerHTML = promociones.map(promo => `
      <div class="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-lg shadow-sm">
        <h4 class="font-bold text-lg text-amber-900">${promo.titulo}</h4>
        <p class="text-gray-700 text-sm mt-1">${promo.descripcion}</p>
        <span class="inline-block mt-3 bg-amber-200 text-amber-900 text-xs font-semibold px-2.5 py-1 rounded">
          Código: ${promo.codigoDescuento}
        </span>
      </div>
    `).join('');
  } catch (error) {
    console.error('Error cargando promociones:', error);
    container.innerHTML = `<p class="text-red-500 text-sm">No se pudieron cargar las promociones.</p>`;
  }
}

// 3. Cargar categorías (/api/categorias)
async function obtenerCategorias() {
  const container = document.getElementById('categorias-container');
  try {
    const response = await fetch(`${API_URL}/api/categorias`);
    if (!response.ok) throw new Error('Error al obtener categorías');
    const categorias = await response.json();

    let html = `
      <button onclick="filtrarCategoria('todas')" class="px-4 py-2 bg-red-800 text-white text-sm font-semibold rounded-full shadow hover:bg-red-700 transition">
        Todas
      </button>
    `;

    html += categorias.map(cat => `
      <button onclick="filtrarCategoria('${cat.nombre}')" class="px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-semibold rounded-full hover:bg-red-800 hover:text-white transition">
        ${cat.nombre}
      </button>
    `).join('');

    container.innerHTML = html;
  } catch (error) {
    console.error('Error cargando categorías:', error);
  }
}

// 4. Cargar platillos (/api/ropa)
async function obtenerMenu() {
  const container = document.getElementById('menu-container');
  try {
    const response = await fetch(`${API_URL}/api/ropa`);
    if (!response.ok) throw new Error('Error al obtener platillos');
    listaPlatillos = await response.json();

    renderizarPlatillos(listaPlatillos);
  } catch (error) {
    console.error('Error cargando menú:', error);
    container.innerHTML = `<p class="text-red-500 col-span-full">Error al cargar el menú de platillos.</p>`;
  }
}

// Función para pintar los platillos en el HTML
function renderizarPlatillos(platillos) {
  const container = document.getElementById('menu-container');
  if (platillos.length === 0) {
    container.innerHTML = `<p class="text-gray-500 col-span-full">No hay platillos disponibles en esta categoría.</p>`;
    return;
  }

  container.innerHTML = platillos.map(item => {
    const precioFinal = item.descuento > 0 
      ? (item.precio * (1 - item.descuento / 100)).toFixed(2)
      : item.precio.toFixed(2);

    return `
      <div class="bg-white rounded-xl shadow-md overflow-hidden flex flex-col justify-between hover:shadow-xl transition border border-gray-100">
        <div>
          <div class="relative">
            <img src="${item.imagen}" alt="${item.nombre}" class="w-full h-48 object-cover" />
            ${item.descuento > 0 ? `
              <span class="absolute top-2 right-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-full shadow">
                -${item.descuento}%
              </span>
            ` : ''}
            <span class="absolute bottom-2 left-2 bg-black/60 backdrop-blur-sm text-white text-xs px-2 py-0.5 rounded">
              ${item.genero}
            </span>
          </div>
          <div class="p-4 space-y-2">
            <span class="text-xs font-bold text-red-700 uppercase tracking-wider">${item.categoria}</span>
            <h4 class="font-bold text-lg text-gray-800 leading-snug">${item.nombre}</h4>
            <p class="text-gray-600 text-xs line-clamp-2">${item.descripcion}</p>
            <p class="text-xs text-gray-400 italic">Ingredientes: ${item.material}</p>
          </div>
        </div>

        <div class="p-4 pt-0 mt-2 border-t border-gray-100 flex justify-between items-end">
          <div>
            ${item.descuento > 0 ? `<span class="text-xs text-gray-400 line-through">S/ ${item.precio.toFixed(2)}</span><br>` : ''}
            <span class="text-xl font-extrabold text-gray-900">S/ ${precioFinal}</span>
          </div>
          <span class="text-xs ${item.stock > 0 ? 'text-emerald-600 bg-emerald-50' : 'text-red-600 bg-red-50'} font-medium px-2 py-1 rounded">
            Stock: ${item.stock}
          </span>
        </div>
      </div>
    `;
  }).join('');
}

// Filtro por categoría (Disponible globalmente)
window.filtrarCategoria = function(categoria) {
  if (categoria === 'todas') {
    renderizarPlatillos(listaPlatillos);
  } else {
    const filtrados = listaPlatillos.filter(p => p.categoria.toLowerCase() === categoria.toLowerCase());
    renderizarPlatillos(filtrados);
  }
};