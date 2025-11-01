import { Testimonio, testimonios, updateTestimonio } from "../../utils/localDB";

// ============================================================
// 🔹 Activar testimonio
// ============================================================
export function activarTestimonio(id: number) {
  const testimonio = testimonios.find((t: Testimonio) => t.id === id);
  if (testimonio) {
    testimonio.activo = true;
    updateTestimonio(id, { activo: true });
  }
}

// ============================================================
// 🔹 Desactivar testimonio
// ============================================================
export function desactivarTestimonio(id: number) {
  const testimonio = testimonios.find((t: Testimonio) => t.id === id);
  if (testimonio) {
    testimonio.activo = false;
    updateTestimonio(id, { activo: false });
  }
}

// ============================================================
// 🔹 Validar URL de video (YouTube o no-cookie)
// ============================================================
export function validarVideoURL(url: string): boolean {
  const regex =
    /^(https:\/\/(www\.)?(youtube\.com|youtu\.be|youtube-nocookie\.com)\/(watch\?v=|embed\/)?[\w-]+)/;
  return regex.test(url);
}
