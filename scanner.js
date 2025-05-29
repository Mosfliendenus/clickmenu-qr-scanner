// Elementos del DOM
const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const resultText = document.getElementById('result-text');
const retryBtn = document.getElementById('retry-btn');

// 1. Solicitar acceso a la cámara
async function initCamera() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
            video: { 
                facingMode: "environment",
                width: { ideal: 1280 },
                height: { ideal: 720 }
            } 
        });
        video.srcObject = stream;
        video.play();
        requestAnimationFrame(scanQR);
    } catch (err) {
        console.error("Error al acceder a la cámara:", err);
        resultText.innerHTML = "Error: " + err.message + "<br>Por favor habilita los permisos de cámara";
        retryBtn.hidden = false;
    }
}

// 2. Escanear QR
function scanQR() {
    if (video.readyState === video.HAVE_ENOUGH_DATA) {
        canvas.height = video.videoHeight;
        canvas.width = video.videoWidth;
        
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        
        // Usar jsQR para decodificar
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: "dontInvert",
        });
        
        if (code) {
            if (validateURL(code.data)) {
                resultText.textContent = "Menú encontrado! Redirigiendo...";
                setTimeout(() => {
                    window.location.href = code.data;
                }, 1000);
            } else {
                resultText.textContent = "QR no válido: Debe ser un menú ClickMenu";
                retryBtn.hidden = false;
                video.pause();
            }
        } else {
            requestAnimationFrame(scanQR);
        }
    } else {
        requestAnimationFrame(scanQR);
    }
}

// 3. Validar URL
function validateURL(url) {
    try {
        const urlObj = new URL(url);
        return urlObj.hostname.includes('clickmenu.mx') && 
               urlObj.pathname.includes('/menu/');
    } catch {
        return false;
    }
}

// 4. Botón de reintento
retryBtn.addEventListener('click', () => {
    retryBtn.hidden = true;
    resultText.textContent = "Enfoca un código QR de ClickMenu";
    video.play();
    requestAnimationFrame(scanQR);
});

// 5. Iniciar cuando todo esté listo
document.addEventListener('DOMContentLoaded', () => {
    // Verificar si jsQR está cargado
    if (typeof jsQR === 'function') {
        initCamera();
    } else {
        // Cargar jsQR dinámicamente si falla
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.min.js';
        script.onload = initCamera;
        document.head.appendChild(script);
    }
});

// 6. Manejar cambios de orientación en móviles
window.addEventListener('orientationchange', () => {
    // Reiniciar la cámara al cambiar orientación
    if (video.srcObject) {
        video.srcObject.getTracks().forEach(track => track.stop());
    }
    initCamera();
});
