import { jwtDecode } from "jwt-decode";
import { getUsers, updateUserData, createUser } from "../utils/localDB";
import { setCurrentUser } from "../utils/auth";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

export async function handleGoogleSuccess(
  credentialResponse: any,
  router: AppRouterInstance,
  setErr: (msg: string | null) => void,
  recoverMode: boolean,
  setRecoverUser: (u: any) => void,
  setRecoverStep: (s: "verify" | "reset") => void
) {
  try {
    const decoded: any = jwtDecode(credentialResponse.credential!);
    const email = (decoded.email || "").toLowerCase();

    if (!email) {
      setErr("No se recibió correo desde Google.");
      return;
    }

    const users = getUsers();
    const found = users.find((u) => u.email.toLowerCase() === email);

    // ===== Flujo de recuperación =====
    if (recoverMode) {
      if (found) {
        setRecoverUser(found);
        setRecoverStep("reset");
        setErr(null);
      } else {
        setErr("No encontramos una cuenta asociada a este correo.");
      }
      return;
    }

    // ===== Flujo normal =====
    if (found) {
      // Actualiza la foto si viene nueva
      if (decoded.picture && decoded.picture !== found.photo) {
        updateUserData({ photo: decoded.picture }, found.email); // ✅ correcto
      }

      // Guarda sesión y redirige
      setCurrentUser(found);
      router.push("/");
      return;
    }

    // ===== Usuario nuevo → Registro prellenado =====
    const nameParam = encodeURIComponent(decoded.name || "");
    const emailParam = encodeURIComponent(decoded.email || "");
    const photoParam = encodeURIComponent(decoded.picture || "");

    router.push(`/register?name=${nameParam}&email=${emailParam}&photo=${photoParam}`);
  } catch (error) {
    console.error("Error durante la autenticación con Google:", error);
    setErr("Error al autenticar con Google.");
  }
}
