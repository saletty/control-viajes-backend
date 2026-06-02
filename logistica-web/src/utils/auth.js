export function logout(navigate) {
  // 🧹 Limpiar LocalStorage (por si acaso quedó algo de versiones anteriores)
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  localStorage.clear();

  // 🧹 Limpiar SessionStorage (lo que estamos usando ahora para mayor seguridad)
  sessionStorage.removeItem("token");
  sessionStorage.removeItem("user");
  sessionStorage.clear();

  // 🚀 Redirigir al Login
  // Usamos replace: true para que el usuario no pueda darle "atrás" en el navegador 
  // y volver a ver los detalles del viaje.
  navigate("/", { replace: true });
}