// Seleccionar elementos del DOM
const scanButton = document.getElementById('scan-button');
const qrReader = document.getElementById('qr-reader');
const menuDisplay = document.getElementById('menu-display');
const menuContent = document.getElementById('menu-content');

// Inicializar el escáner de QR
const html5QrCode = new Html5Qrcode('qr-reader');

// Función para mostrar u ocultar secciones
function toggleSections(showScanner) {
    qrReader.classList.toggle('hidden', !showScanner);
    scanButton.classList.toggle('hidden', showScanner);
    menuDisplay.classList.add('hidden');
}

// Función para manejar el resultado del escaneo
function onScanSuccess(decodedText, decodedResult) {
    // Detener el escáner
    html5QrCode.stop().then(() => {
        toggleSections(false);
        displayMenu(decodedText);
    }).catch(err => console.error('Error al detener el escáner:', err));
}

// Función para mostrar el menú digital
function displayMenu(url) {
    // Validar si es una URL válida
    try {
        new URL(url);
        // Simular carga de menú (en un caso real, harías una petición HTTP)
        const menuData = {
            title: 'Menú Digital',
            items: [
                { name: 'Café Americano', price: '$3.00' },
                { name: 'Croissant', price: '$2.50' },
                { name: 'Jugo Natural', price: '$4.00' }
            ]
        };

        // Guardar en localStorage
        saveMenu(url, menuData);

        // Mostrar en la interfaz
        menuContent.innerHTML = `
            <h3>${menuData.title}</h3>
            <ul>
                ${menuData.items.map(item => `<li>${item.name} - ${item.price}</li>`).join('')}
            </ul>
            <a href="${url}" target="_blank">Ver menú completo</a>
        `;
        menuDisplay.classList.remove('hidden');
    } catch (e) {
        menuContent.innerHTML = '<p>El código QR no contiene una URL válida.</p>';
        menuDisplay.classList.remove('hidden');
    }
}

// Guardar menú en localStorage
function saveMenu(url, menuData) {
    const menus = JSON.parse(localStorage.getItem('menus') || '{}');
    menus[url] = menuData;
    localStorage.setItem('menus', JSON.stringify(menus));
}

// Evento para iniciar el escaneo
scanButton.addEventListener('click', () => {
    toggleSections(true);
    html5QrCode.start(
        { facingMode: 'environment' }, // Usar cámara trasera
        { fps: 10, qrbox: { width: 250, height: 250 } }, // Configuración
        onScanSuccess,
        (errorMessage) => console.warn('Error en escaneo:', errorMessage)
    ).catch(err => console.error('Error al iniciar el escáner:', err));
});
