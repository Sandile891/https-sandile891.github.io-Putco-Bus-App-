// Variables for toggling the camera and location
let isCameraOn = false;
let isLocationOn = false;
let locationWatchId = null;

// Start the barcode scanner using QuaggaJS
function startBarcodeScanner() {
    Quagga.init({
        inputStream: {
            name: "Live",
            type: "LiveStream",
            target: document.querySelector('#scanner-container'), // Camera feed container
            constraints: {
                facingMode: "environment" // Use rear camera
            }
        },
        decoder: {
            readers: ["code_128_reader"] // Barcode type (CODE128)
        }
    }, function(err) {
        if (err) {
            console.error("Error initializing QuaggaJS:", err);
            alert("Failed to start camera. Please check camera permissions.");
            return;
        }
        Quagga.start();
        isCameraOn = true;
        document.getElementById('scanner-container').style.display = 'block';
    });

    // Handle detected barcode
    Quagga.onDetected(function(result) {
        const barcode = result.codeResult.code;
        document.getElementById('barcode-result').textContent = `Ticket ID: ${barcode}`;

        // Send barcode data to Firestore for validation and deletion
        validateAndDeleteBarcode(barcode);
    });
}

// Stop the barcode scanner
function stopBarcodeScanner() {
    if (isCameraOn) {
        Quagga.stop();
        document.getElementById('scanner-container').style.display = 'none';
        isCameraOn = false;
    }
}

// Enable location tracking
function enableLocation() {
    if (navigator.geolocation) {
        locationWatchId = navigator.geolocation.watchPosition(position => {
            const latitude = position.coords.latitude;
            const longitude = position.coords.longitude;

            document.getElementById('location-status').textContent = `Location enabled: Lat ${latitude}, Lng ${longitude}`;

            // Send location to server (mock example)
            fetch('/update-location', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ lat: latitude, lng: longitude })
            });

        }, () => {
            alert('Unable to access location.');
        });
        isLocationOn = true;
    } else {
        alert('Geolocation is not supported by this browser.');
    }
}

// Disable location tracking
function disableLocation() {
    if (isLocationOn && locationWatchId !== null) {
        navigator.geolocation.clearWatch(locationWatchId);
        document.getElementById('location-status').textContent = 'Location disabled';
        isLocationOn = false;
    }
}

// Function to validate and delete barcode from Firestore
function validateAndDeleteBarcode(barcode) {
    // Firestore initialization
    const db = firebase.firestore();
    const barcodeRef = db.collection('tickets').doc(barcode);

    barcodeRef.get().then((doc) => {
        if (doc.exists) {
            // Barcode is valid, proceed to delete
            barcodeRef.delete().then(() => {
                alert('Ticket is valid and has been deleted from the server.');
            }).catch((error) => {
                console.error("Error deleting document: ", error);
                alert('Error deleting ticket from server.');
            });
        } else {
            alert('Ticket is invalid.');
        }
    }).catch((error) => {
        console.error("Error getting document:", error);
    });
}

// Button Event Listeners
document.getElementById('camera-btn').addEventListener('click', () => {
    startBarcodeScanner();
    document.getElementById('camera-btn').style.display = 'none';
    document.getElementById('stop-camera-btn').style.display = 'inline-block';
});

document.getElementById('stop-camera-btn').addEventListener('click', () => {
    stopBarcodeScanner();
    document.getElementById('stop-camera-btn').style.display = 'none';
    document.getElementById('camera-btn').style.display = 'inline-block';
});

document.getElementById('location-on-btn').addEventListener('click', () => {
    enableLocation();
    document.getElementById('location-on-btn').style.display = 'none';
    document.getElementById('location-off-btn').style.display = 'inline-block';
});

document.getElementById('location-off-btn').addEventListener('click', () => {
    disableLocation();
    document.getElementById('location-off-btn').style.display = 'none';
    document.getElementById('location-on-btn').style.display = 'inline-block';
});

// Service Worker Registration
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('service-worker.js')
            .then((registration) => {
                console.log('Service Worker registered with scope:', registration.scope);
            })
            .catch((error) => {
                console.error('Service Worker registration failed:', error);
            });
    });
}
////

           navigator.mediaDevices.getUserMedia({ video: true })
  .then(function(stream) {
    // Success - camera started
    const videoElement = document.querySelector('video');
    videoElement.srcObject = stream;
  })
  .catch(function(error) {
    console.log('Error accessing the camera: ', error);
    // Handle different error cases
    if (error.name === 'NotReadableError') {
      alert('Camera is already in use by another application.');
    } else if (error.name === 'NotAllowedError') {
      alert('Camera access is not allowed. Please enable camera permissions.');
    } else {
      alert('Error accessing the camera: ' + error.message);
    }
  });

  const canvas = document.createElement('canvas');
const context = canvas.getContext('2d', { willReadFrequently: true });

/////

// JavaScript for interactive features
document.addEventListener('DOMContentLoaded', function() {
    const buttons = document.querySelectorAll('.btn');

    buttons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            alert('This feature is coming soon!');
        });
    });
});

self.addEventListener('install', function(event) {
    event.waitUntil(
      caches.open('v1').then(function(cache) {
        return cache.addAll([
          '/',
          'index.html',
          'manifest.json',
          'drivercss.css',
          'driverjs.js',
          'logo.png',
        ]);
      })
    );
  });
  
  self.addEventListener('fetch', function(event) {
    event.respondWith(
      caches.match(event.request).then(function(response) {
        return response || fetch(event.request);
      })
    );
  });

  /////
  let deferredPrompt;

  window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent the mini-infobar from appearing on mobile
    e.preventDefault();
    // Store the event for later use
    deferredPrompt = e;
    
    // Display your custom install button or message here
    const installButton = document.getElementById('install-button');
    installButton.style.display = 'block';
  
    installButton.addEventListener('click', () => {
      // Show the install prompt
      deferredPrompt.prompt();
      // Wait for user response
      deferredPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('User accepted the install prompt');
        } else {
          console.log('User dismissed the install prompt');
        }
        deferredPrompt = null; // Reset
      });
    });
  });
  
