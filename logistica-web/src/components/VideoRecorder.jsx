import React, { useState, useRef, useEffect } from 'react';
import { Video, StopCircle, RefreshCw, Upload, CheckCircle } from 'lucide-react';
import API_URL from "../api";

const VideoRecorder = ({ tripId, type, onUploadSuccess }) => {
  const [recording, setRecording] = useState(false);
  const [videoBlob, setVideoBlob] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60); // Límite de 1 minuto

  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const timerRef = useRef(null);

  // Limpiar recursos al cerrar
  useEffect(() => {
    return () => {
      if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
      clearInterval(timerRef.current);
    };
  }, []);

  const startRecording = async () => {
    try {
      setVideoBlob(null);
      setPreviewUrl(null);
      setTimeLeft(60);

      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "environment" }, // Cámara trasera
        audio: true 
      });
      
      streamRef.current = stream;
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      const chunks = [];
      mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/mp4' });
        setVideoBlob(blob);
        setPreviewUrl(URL.createObjectURL(blob));
      };

      mediaRecorder.start();
      setRecording(true);

      // Iniciar cuenta regresiva
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            stopRecording();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

    } catch (err) {
      alert("Error: Verifica permisos de cámara y micrófono.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop();
      streamRef.current.getTracks().forEach(track => track.stop());
      setRecording(false);
      clearInterval(timerRef.current);
    }
  };

  const uploadVideo = async () => {
    if (!videoBlob) return;
    setUploading(true);

    const formData = new FormData();
    formData.append('file', videoBlob, `trip_${tripId}_video.mp4`);

    try {
      const res = await fetch(`${API_URL}/api/TripVideos/${tripId}?type=${type}`, {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        alert("Video de evidencia subido ✔");
        if (onUploadSuccess) onUploadSuccess();
      } else {
        const errText = await res.text();
        alert("Error al subir: " + errText);
      }
    } catch (err) {
      alert("Error de conexión: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="w-full bg-gray-900 rounded-3xl p-6 text-white shadow-xl border border-gray-800">
      <div className="flex justify-between items-center mb-4">
        <h4 className="text-sm font-bold tracking-widest uppercase">Video de {type}</h4>
        {recording && (
          <span className="text-red-500 animate-pulse font-mono font-bold">
            00:{timeLeft < 10 ? `0${timeLeft}` : timeLeft}
          </span>
        )}
      </div>

      <div className="aspect-video bg-black rounded-2xl overflow-hidden flex items-center justify-center border border-gray-700 mb-6">
        {recording ? (
          <div className="flex flex-col items-center">
            <div className="w-4 h-4 bg-red-600 rounded-full animate-ping mb-2"></div>
            <p className="text-xs uppercase">Grabando...</p>
          </div>
        ) : previewUrl ? (
          <video src={previewUrl} controls className="w-full h-full object-contain" />
        ) : (
          <Video size={48} className="text-gray-700" />
        )}
      </div>

      <div className="flex justify-center gap-4">
        {!recording && !videoBlob && (
          <button onClick={startRecording} className="flex items-center gap-2 bg-white text-black px-6 py-3 rounded-full font-bold active:scale-95 transition-transform">
            <Video size={20} /> Grabar Video
          </button>
        )}

        {recording && (
          <button onClick={stopRecording} className="flex items-center gap-2 bg-red-600 text-white px-8 py-3 rounded-full font-bold active:scale-95 transition-transform">
            <StopCircle size={20} /> Detener
          </button>
        )}

        {videoBlob && !recording && !uploading && (
          <>
            <button onClick={startRecording} className="p-4 bg-gray-800 rounded-full text-white active:scale-90 transition-transform">
              <RefreshCw size={24} />
            </button>
            <button onClick={uploadVideo} className="flex-1 flex items-center justify-center gap-2 bg-green-500 text-white py-3 rounded-full font-bold active:scale-95 transition-transform">
              <Upload size={20} /> Subir Evidencia
            </button>
          </>
        )}

        {uploading && (
          <div className="flex flex-col items-center gap-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            <p className="text-xs text-gray-400">Subiendo video pesado...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoRecorder;