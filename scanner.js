// Seleccionar elementos del DOM
// Seleccionar elementos del DOM
const scanButton = document.getElementById('scan-button');
const qrReader = document.getElementById('qr-reader');
const menuDisplay = document.getElementById('menu-display');
const menuContent = document.getElementById('menu-content');

// Verificar si los elementos existen
if (!scanButton || !qrReader || !menuDisplay || !menuContent) {
    console.error('Error: Uno o más elementos del DOM no se encontraron.');
    alert('Error en la carga de la aplicación. Revisa la consola para más detalles.');
    return;
}

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
    console.log('Código QR escaneado:', decodedText);
    html5QrCode.stop().then(() => {
        toggleSections(false);
        displayMenu(decodedText);
    }).catch(err => console.error('Error al detener el escáner:', err));
}

// Función para mostrar el menú digital
function displayMenu(url) {
    try {
        new URL(url);
        const menuData = {
            title: 'Menú Digital',
            items: [
                { name: 'Café Americano', price: '$3.00' },
                { name: 'Croissant', price: '$2.50' },
                { name: 'Jugo Natural', price: '$4.00' }
            ]
        };
        saveMenu(url, menuData);
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
    console.log('Botón de escanear clicado');
    toggleSections(true);
    html5QrCode.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        onScanSuccess,
        (errorMessage) => console.warn('Error en escaneo:', errorMessage)
    ).then(() => {
        console.log('Escáner iniciado correctamente');
    }).catch(err => {
        console.error('Error al iniciar el escáner:', err);
        alert('No se pudo iniciar el escáner. Revisa la consola para más detalles.');
        toggleSections(false);
    });
});
