import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft, Loader2 } from "lucide-react";
import API_URL from "../api";

export default function EventReport() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [recording, setRecording] = useState(false);
  const [audioBlobs, setAudioBlobs] = useState([]);
  const [eventPhoto, setEventPhoto] = useState(null);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [uploading, setUploading] = useState(false);

  const [reason, setReason] = useState("");
  const [observation, setObservation] = useState("");


  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true
      });

      const recorder = new MediaRecorder(stream);
      const chunks = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks, {
          type: "audio/webm"
        });

        const url = URL.createObjectURL(blob);

        setAudioBlobs(prev => [
          ...prev,
          {
            blob,
            url
          }
        ]);

        stream.getTracks().forEach(track => track.stop());

        setRecording(false);
      };

      recorder.start();

      setMediaRecorder(recorder);
      setRecording(true);

    } catch (err) {
      alert("No se pudo acceder al micrófono");
    }
  };

  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
    }
  };

  const removeAudio = (indexToRemove) => {
    setAudioBlobs(prev => {
      const updated = [...prev];

      URL.revokeObjectURL(
        updated[indexToRemove].url
      );

      updated.splice(indexToRemove, 1);

      return updated;
    });
  };

  const uploadEvent = async () => {
    if (
      audioBlobs.length === 0 &&
      !eventPhoto
    ) {
      alert("Debe agregar audio o foto");
      return;
    }

    setUploading(true);

    try {
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
      // SOLO FOTO
      if (
        audioBlobs.length === 0 &&
        eventPhoto
      ) {
        const formData = new FormData();

        formData.append("photo", eventPhoto);
        formData.append("reason", reason);
        formData.append("observation", observation);

        formData.append("latitude", latitude ?? "");
        formData.append("longitude", longitude ?? "");
        formData.append(
        "captureDate",
        new Date().toISOString()
        );
        const res = await fetch(
          `${API_URL}/api/TripEvents/${id}`,
          {
            method: "POST",
            body: formData
          }
        );

        if (!res.ok) {
          throw new Error(
            await res.text()
          );
        }
      }

      // AUDIO O AUDIO+FOTO
      for (
        const [index, audio]
        of audioBlobs.entries()
      ) {
        const formData = new FormData();

        formData.append(
          "audio",
          audio.blob,
          `evento_${Date.now()}_${index}.webm`
        );
        formData.append("reason", reason);
        formData.append("observation", observation);

        formData.append("latitude", latitude ?? "");
        formData.append("longitude", longitude ?? "");
        formData.append(
        "captureDate",
        new Date().toISOString()
        );

        if (eventPhoto) {
          formData.append(
            "photo",
            eventPhoto
          );
        }

        const res = await fetch(
          `${API_URL}/api/TripEvents/${id}`,
          {
            method: "POST",
            body: formData
          }
        );

        if (!res.ok) {
          throw new Error(
            "Fallo al subir evento"
          );
        }
      }

      audioBlobs.forEach(a =>
        URL.revokeObjectURL(a.url)
      );

      alert("✔ Evento registrado");

      navigate(`/trip-details/${id}`);

    } catch (err) {
      alert(err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">

      <header className="bg-white px-6 py-4 flex items-center gap-4 border-b">
        <button
          onClick={() => navigate(-1)}
        >
          <ChevronLeft size={24} />
        </button>

        <h1 className="text-xl font-bold">
          REGISTRAR EVENTO
        </h1>
      </header>

      <div className="max-w-xl mx-auto p-4 space-y-6">

        <select
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full border rounded-xl p-3"
            >
            <option value="">Seleccione motivo</option>

            <option value="Inspección policial">
                Inspección policial
            </option>

            <option value="Control aduanero">
                Control aduanero
            </option>

            <option value="Control militar">
                Control militar
            </option>

            <option value="Inspección del cliente">
                Inspección del cliente
            </option>

            <option value="Revisión en balanza">
                Revisión en balanza
            </option>

            <option value="Cambio de carga">
                Cambio de carga
            </option>

            <option value="Daño accidental">
                Daño accidental del precinto
            </option>

            <option value="Emergencia mecánica">
                Emergencia mecánica
            </option>

            <option value="Otro">
                Otro motivo
            </option>
        </select>

        {reason === "Otro" && (
            <textarea
                value={observation}
                onChange={(e) => setObservation(e.target.value)}
                placeholder="Explique el motivo"
                className="w-full mt-3 border rounded-xl p-3"
            />
        )}
        {/* AUDIO */}

        <div className="bg-white rounded-2xl p-6 shadow">

          <h3 className="font-bold mb-4">
            Audio
          </h3>

          <button
            onClick={
              recording
                ? stopRecording
                : startRecording
            }
            className={`w-full py-4 rounded-xl font-bold text-white ${
              recording
                ? "bg-red-500"
                : "bg-black"
            }`}
          >
            {recording
              ? "Detener grabación"
              : "Grabar audio"}
          </button>

        </div>

        {/* AUDIOS PENDIENTES */}

        {audioBlobs.map(
          (audio, index) => (
            <div
              key={index}
              className="bg-white p-4 rounded-xl shadow"
            >
              <div className="flex justify-between mb-2">

                <p className="text-sm">
                  Audio #{index + 1}
                </p>

                <button
                  onClick={() =>
                    removeAudio(index)
                  }
                  className="text-red-500 font-bold"
                >
                  Eliminar
                </button>

              </div>

              <audio
                controls
                className="w-full"
              >
                <source
                  src={audio.url}
                  type="audio/webm"
                />
              </audio>

            </div>
          )
        )}

        {/* FOTO */}

        <div className="bg-white rounded-2xl p-6 shadow">

          <button
            onClick={() =>
              document
                .getElementById(
                  "event-photo-input"
                )
                .click()
            }
            className="w-full py-4 rounded-xl bg-red-600 text-white font-bold"
          >
            TOMAR FOTO
          </button>

          <input
            id="event-photo-input"
            type="file"
            accept="image/*"
            capture="environment"
            hidden
            onChange={(e) => {
              if (e.target.files[0]) {
                setEventPhoto(
                  e.target.files[0]
                );
              }
            }}
          />

        </div>

        {/* PREVIEW FOTO */}

        {eventPhoto && (
          <div className="bg-white rounded-2xl p-4 shadow">

            <img
              src={URL.createObjectURL(
                eventPhoto
              )}
              alt="preview"
              className="w-full h-56 object-cover rounded-xl"
            />

            <button
              onClick={() =>
                setEventPhoto(null)
              }
              className="w-full mt-3 bg-red-500 text-white py-2 rounded-lg font-bold"
            >
              ELIMINAR FOTO
            </button>

          </div>
        )}

        {/* SUBIR */}

        <button
          onClick={uploadEvent}
          disabled={
            uploading ||
            (
              audioBlobs.length === 0 &&
              !eventPhoto
            )
          }
          className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold disabled:opacity-50"
        >
          {uploading ? (
            <Loader2
              className="animate-spin mx-auto"
            />
          ) : (
            "Subir Evento"
          )}
        </button>

      </div>
    </div>
  );
}