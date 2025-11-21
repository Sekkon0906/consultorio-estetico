import { jwtDecode } from "jwt-decode";
import { getUsers, updateUserData, User } from "../utils/localDB";
import { setCurrentUser } from "../utils/auth";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

interface GoogleCredentialResponse {
  credential?: string;
}

interface GoogleDecodedToken {
  email?: string;
  name?: string;
  picture?: string;
  phone_number?: string;
}

export async function handleGoogleSuccess(
  credentialResponse: GoogleCredentialResponse,
  router: AppRouterInstance,
  setErr: (msg: string | null) => void,
  recoverMode: boolean,
  setRecoverUser: (u: User | null) => void,
  setRecoverStep: (s: "verify" | "reset") => void
) {
  try {
    if (!credentialResponse.credential) {
      setErr("Error al recibir datos de Google.");
      return;
    }

    const decoded = jwtDecode<GoogleDecodedToken>(credentialResponse.credential);
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

    // ===== Flujo normal (inicio de sesión existente) =====
    if (found) {
      if (decoded.picture && decoded.picture !== found.photo) {
        updateUserData({ photo: decoded.picture }, found.email);
      }

      setCurrentUser(found);
      router.push("/");
      return;
    }

    // ===== Usuario nuevo → Registro prellenado =====
    const fullName = decoded.name || "";
    const [firstName, ...rest] = fullName.split(" ");
    const lastName = rest.join(" ");

    const emailParam = encodeURIComponent(email);
    const nombresParam = encodeURIComponent(firstName || "");
    const apellidosParam = encodeURIComponent(lastName || "");
    const telefonoParam = encodeURIComponent(decoded.phone_number || "");
    const photoParam = encodeURIComponent(decoded.picture || "");

    router.push(
      `/register?email=${emailParam}&nombres=${nombresParam}&apellidos=${apellidosParam}&telefono=${telefonoParam}&photo=${photoParam}`
    );
  } catch (error) {
    console.error("Error durante la autenticación con Google:", error);
    setErr("Error al autenticar con Google.");
  }
}
