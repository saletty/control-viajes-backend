import React, { useRef, useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Camera, RefreshCw, Check, X } from 'lucide-react';
import API_URL from "../api";


const CameraUpload = () => {
  const { tripId, type } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  
// Obtener photoId si existe (para reemplazos)
  const queryParams = new URLSearchParams(window.location.search);
  const photoId = queryParams.get('photoId');
  
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [image, setImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [stream, setStream] = useState(null);

  // Iniciar la cámara al cargar
  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, []);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { exact: "environment" } }, // Intenta usar cámara trasera
        audio: false
      }).catch(() => {
        return navigator.mediaDevices.getUserMedia({ video: true }); // Fallback a cualquier cámara
      });
      
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error("Error al acceder a la cámara:", err);
      alert("No se pudo acceder a la cámara. Verifica los permisos.");
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (video && canvas) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      canvas.getContext('2d').drawImage(video, 0, 0);
      
      // Cambia 'image/jpeg' por esto, el 0.7 reduce la calidad al 70% y baja mucho el peso
      const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
      setImage(dataUrl);
      stopCamera();
    }
  };

      const openGallery = () => {
      fileInputRef.current?.click();
    };
    const handleGalleryImage = (e) => {
      const file = e.target.files?.[0];

      if (!file) return;

      const reader = new FileReader();

      reader.onload = () => {
        setImage(reader.result);
        stopCamera();
      };

      reader.readAsDataURL(file);
    };

  const uploadPhoto = async () => {
      if (!image || !tripId) {
        alert("Faltan datos");
        return;
      }

      setUploading(true);

      try {
    const base64ToBlob = (base64) => {
      const arr = base64.split(',');
      const mime = arr[0].match(/:(.*?);/)[1];
      const bstr = atob(arr[1]);
      let n = bstr.length;
      const u8arr = new Uint8Array(n);
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }
      return new Blob([u8arr], { type: mime });
    };
      let latitude = null;
      let longitude = null;

      try {
        const position = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(
            resolve,
            reject,
            {
              enableHighAccuracy: true,
              timeout: 10000,
              maximumAge: 0
            }
          );
        });

        latitude = position.coords.latitude;
        longitude = position.coords.longitude;

      } catch (gpsError) {
        console.warn("No se pudo obtener GPS:", gpsError);
      }
    const blob = base64ToBlob(image);
    const formData = new FormData();
    formData.append('file', blob, `trip_${tripId}_${type}.jpeg`);
    formData.append("latitude", latitude ?? "");
    formData.append("longitude", longitude ?? "");
    formData.append("captureDate", new Date().toISOString());

    // --- LÓGICA DINÁMICA DE URL Y MÉTODO ---
    // Si hay photoId es un reemplazo (PUT), si no, es nueva (POST)
    let finalUrl;
    let method;

    if (photoId) {
      // Endpoint para actualizar foto existente
      finalUrl = `${API_URL}/api/TripPhotos/update/${photoId}`;
      method = "PUT";
    } else {
      // Endpoint normal para nueva foto
      finalUrl = `${API_URL}/api/TripPhotos/${tripId}?type=${(type || "").toUpperCase()}`;
      method = "POST";
    }

    console.log(`${method} a:`, finalUrl);

    const uploadRes = await fetch(finalUrl, {
      method: method,
      body: formData
    });

    if (uploadRes.ok) {
      alert(photoId ? "Foto corregida ✔" : "Foto subida ✔");
      navigate(-1);
    } else {
      const text = await uploadRes.text();
      alert("Error servidor: " + text);
    }

    } catch (err) {
    console.error("ERROR REAL:", err);
      alert("ERROR REAL: " + err.message);
    } finally {
    setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-between p-4 text-white">
      <div className="w-full flex justify-between items-center">
        <button onClick={() => navigate(-1)} className="p-2"><X size={28} /></button>
        <span className="font-bold uppercase tracking-widest text-sm">Cámara Terranera</span>
        <div className="w-10"></div>
      </div>

      <div className="relative w-full max-w-md aspect-[3/4] bg-gray-900 rounded-3xl overflow-hidden shadow-2xl border border-gray-800">
        {!image ? (
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            className="w-full h-full object-cover"
          />
        ) : (
          <img src={image} className="w-full h-full object-cover" alt="Captura" />
        )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleGalleryImage}
            hidden
          />
        <canvas ref={canvasRef} className="hidden" />
      </div>

      <div className="w-full max-w-md pb-8 flex justify-center items-center gap-8">
        {!image ? (
  <>
    <button
      onClick={openGallery}
      className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center text-white active:scale-90 transition-transform"
    >
      🖼
    </button>

    <button
      onClick={capturePhoto}
      className="w-20 h-20 bg-white rounded-full border-8 border-gray-800 flex items-center justify-center active:scale-90 transition-transform"
    >
      <div className="w-12 h-12 bg-white rounded-full border-2 border-black"></div>
    </button>
  </>
) : (
  <>
    <button
      onClick={() => {
        setImage(null);
        startCamera();
      }}
      className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center text-white active:scale-90 transition-transform"
      disabled={uploading}
    >
      <RefreshCw size={28} />
    </button>

    <button
      onClick={uploadPhoto}
      className={`w-20 h-20 ${
        uploading ? "bg-gray-600" : "bg-green-500"
      } rounded-full flex items-center justify-center text-white shadow-lg shadow-green-900/20 active:scale-90 transition-transform`}
      disabled={uploading}
    >
      {uploading ? (
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      ) : (
        <Check size={40} />
      )}
    </button>
  </>
)}
      </div>
    </div>
  );
};

export default CameraUpload;