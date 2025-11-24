"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PALETTE } from "../../agendar/page";
import {
  getHorarioGlobal,
  setHorarioGlobal,
  HoraDisponible,
} from "../../utils/localDB";
import CitasAgendadasModalSimple from "../citas/citasAgendadasModalSimple";
import { Cita } from "../citas/helpers";

// ===== Helpers =====
const normalizarHora = (h: string): string =>
  h.trim().toLowerCase().replace(/\s+/g, "").replace(/^0/, "");

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

// Tipo local para bloqueos
interface BloqueoHora {
  id?: number;
  fechaISO: string;
  hora: string;
  motivo: string;
}

export default function HorariosHabilitados() {
  const hoy = new Date();
  const [mes, setMes] = useState(hoy.getMonth());
  const [anio, setAnio] = useState(hoy.getFullYear());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const [horarioGlobal, setHorarioGlobalState] = useState<HoraDisponible[]>(
    getHorarioGlobal()
  );
  const [horasDelDia, setHorasDelDia] = useState<HoraDisponible[]>([]);

  const [toast, setToast] = useState<string | null>(null);
  const [modalGlobal, setModalGlobal] = useState(false);
  const [modalCita, setModalCita] = useState<Cita | null>(null);

  // Citas y bloqueos de la fecha seleccionada
  const [citasDelDia, setCitasDelDia] = useState<Cita[]>([]);
  const [citasOcupadas, setCitasOcupadas] = useState<
    { horaNorm: string; paciente: string; procedimiento: string; id: number }[]
  >([]);
  const [bloqueosDia, setBloqueosDia] = useState<BloqueoHora[]>([]);

  // ===== TOAST =====
  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  // ===== FECHAS =====
  const diasEnMes = new Date(anio, mes + 1, 0).getDate();
  const primerDiaSemana = new Date(anio, mes, 1).getDay();
  const nombresMes = [
    "enero",
    "febrero",
    "marzo",
    "abril",
    "mayo",
    "junio",
    "julio",
    "agosto",
    "septiembre",
    "octubre",
    "noviembre",
    "diciembre",
  ];

  const generarDias = () => {
    const dias: (number | null)[] = [];
    const offset = primerDiaSemana === 0 ? 6 : primerDiaSemana - 1;
    for (let i = 0; i < offset; i++) dias.push(null);
    for (let i = 1; i <= diasEnMes; i++) dias.push(i);
    return dias;
  };

  // ===== CARGAR CITAS + BLOQUEOS DE UN DÍA =====
  useEffect(() => {
    if (!selectedDate) return;

    const cargarDatosDelDia = async () => {
      try {
        // 1) Citas reales desde BD
        const resCitas = await fetch(
          `${API_BASE}/citas?fecha=${selectedDate}`,
          { cache: "no-store" }
        );
        if (!resCitas.ok) throw new Error("Error al obtener citas");

        const dataCitas: { ok: boolean; citas: Cita[] } = await resCitas.json();
        const citas = Array.isArray(dataCitas.citas) ? dataCitas.citas : [];
        setCitasDelDia(citas);

        const horasOcupadas = citas.map((c) => ({
          horaNorm: normalizarHora(c.hora),
          paciente: c.nombres,
          procedimiento: c.procedimiento,
          id: c.id,
        }));
        setCitasOcupadas(horasOcupadas);

        // 2) Bloqueos desde BD
        const resBloq = await fetch(
          `${API_BASE}/bloqueos-horas?fechaISO=${selectedDate}`,
          { cache: "no-store" }
        );
        if (!resBloq.ok) throw new Error("Error al obtener bloqueos");

        const dataBloq: { ok: boolean; bloqueos: BloqueoHora[] } =
          await resBloq.json();
        const bloqueos = Array.isArray(dataBloq.bloqueos)
          ? dataBloq.bloqueos
          : [];
        setBloqueosDia(bloqueos);

        const horasBloqueadas = bloqueos.map((b) => normalizarHora(b.hora));

        // 3) Construir horasDelDia combinando horarioGlobal + bloqueos
        const nuevasHoras = horarioGlobal.map((h) => ({
          ...h,
          // disponible según horarioGlobal Y no esté bloqueada
          disponible:
            h.disponible &&
            !horasBloqueadas.includes(normalizarHora(h.hora)),
        }));
        setHorasDelDia(nuevasHoras);
      } catch (err) {
        console.error("Error cargando datos del día:", err);
        setCitasDelDia([]);
        setCitasOcupadas([]);
        setBloqueosDia([]);

        // fallback: solo horarioGlobal
        setHorasDelDia(horarioGlobal);
      }
    };

    void cargarDatosDelDia();
  }, [selectedDate, horarioGlobal]);

  // ===== CLICK EN DÍA =====
  const handleDateClick = (dia: number | null) => {
    if (!dia) return;
    const fecha = new Date(anio, mes, dia).toISOString().slice(0, 10);
    setSelectedDate(fecha);
  };

  // ===== TOGGLE HORA EN UN DÍA (bloqueo en BD) =====
  const toggleHora = async (hora: string) => {
    if (!selectedDate) return;

    // 1) Si tiene cita → no se puede
    const esOcupada = citasOcupadas.some(
      (c) => c.horaNorm === normalizarHora(hora)
    );
    if (esOcupada) {
      showToast(
        `La hora ${hora} tiene una cita agendada. No puede modificarse.`
      );
      return;
    }

    // 2) Ver si ya está bloqueada
    const bloqueoExistente = bloqueosDia.find(
      (b) => normalizarHora(b.hora) === normalizarHora(hora)
    );

    try {
      if (bloqueoExistente) {
        // ➜ Desbloquear: DELETE bloqueo
        const url = `${API_BASE}/bloqueos-horas/${selectedDate}/${encodeURIComponent(
          hora
        )}`;
        const res = await fetch(url, { method: "DELETE" });
        if (!res.ok) throw new Error("Error al eliminar bloqueo");

        // Actualizamos estado local
        setBloqueosDia((prev) =>
          prev.filter(
            (b) => normalizarHora(b.hora) !== normalizarHora(hora)
          )
        );
        setHorasDelDia((prev) =>
          prev.map((h) =>
            h.hora === hora ? { ...h, disponible: true } : h
          )
        );
        showToast(`Hora ${hora} desbloqueada para ${selectedDate}`);
      } else {
        // ➜ Bloquear: POST bloqueo
        const res = await fetch(`${API_BASE}/bloqueos-horas`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fechaISO: selectedDate,
            hora,
            motivo: "Bloqueada manualmente",
          }),
        });
        if (!res.ok) throw new Error("Error al crear bloqueo");

        const data: { ok: boolean; bloqueo: BloqueoHora | null } =
          await res.json();
        const nuevoBloqueo: BloqueoHora = data.bloqueo || {
          fechaISO: selectedDate,
          hora,
          motivo: "Bloqueada manualmente",
        };

        setBloqueosDia((prev) => [...prev, nuevoBloqueo]);
        setHorasDelDia((prev) =>
          prev.map((h) =>
            h.hora === hora ? { ...h, disponible: false } : h
          )
        );
        showToast(`Hora ${hora} bloqueada para ${selectedDate}`);
      }
    } catch (err) {
      console.error("Error al togglear bloqueo de hora:", err);
      showToast("Ocurrió un error al actualizar la hora.");
    }
  };

  // ===== MODIFICAR HORARIO GLOBAL (solo localDB) =====
  const toggleHoraGlobal = (hora: string) => {
    const actualizado = horarioGlobal.map((h) =>
      h.hora === hora ? { ...h, disponible: !h.disponible } : h
    );

    setHorarioGlobalState(actualizado);
    setHorarioGlobal(actualizado);

    showToast(`Hora ${hora} actualizada globalmente`);

    // Si hay un día seleccionado, recomponemos sus horas usando bloqueosDia
    if (selectedDate) {
      const horasBloqueadas = bloqueosDia.map((b) =>
        normalizarHora(b.hora)
      );
      const nuevas = actualizado.map((h) => ({
        ...h,
        disponible:
          h.disponible &&
          !horasBloqueadas.includes(normalizarHora(h.hora)),
      }));
      setHorasDelDia(nuevas);
    }
  };

  // ===== RECARGAR CITAS + BLOQUEOS TRAS ACTUALIZAR CITA =====
  const recargarDatosDelDia = async () => {
    if (!selectedDate) return;

    try {
      const [resCitas, resBloq] = await Promise.all([
        fetch(`${API_BASE}/citas?fecha=${selectedDate}`, {
          cache: "no-store",
        }),
        fetch(`${API_BASE}/bloqueos-horas?fechaISO=${selectedDate}`, {
          cache: "no-store",
        }),
      ]);

      if (!resCitas.ok || !resBloq.ok) {
        throw new Error("Error al recargar datos");
      }

      const dataCitas: { ok: boolean; citas: Cita[] } =
        await resCitas.json();
      const citas = Array.isArray(dataCitas.citas)
        ? dataCitas.citas
        : [];
      setCitasDelDia(citas);

      const horasOcupadas = citas.map((c) => ({
        horaNorm: normalizarHora(c.hora),
        paciente: c.nombres,
        procedimiento: c.procedimiento,
        id: c.id,
      }));
      setCitasOcupadas(horasOcupadas);

      const dataBloq: { ok: boolean; bloqueos: BloqueoHora[] } =
        await resBloq.json();
      const bloqueos = Array.isArray(dataBloq.bloqueos)
        ? dataBloq.bloqueos
        : [];
      setBloqueosDia(bloqueos);

      const horasBloqueadas = bloqueos.map((b) =>
        normalizarHora(b.hora)
      );

      // Recombinar con horarioGlobal
      const nuevasHoras = horarioGlobal.map((h) => ({
        ...h,
        disponible:
          h.disponible &&
          !horasBloqueadas.includes(normalizarHora(h.hora)),
      }));
      setHorasDelDia(nuevasHoras);
    } catch (err) {
      console.error("Error al recargar datos del día:", err);
    }
  };

  // ===== RENDER =====
  return (
    <div className="p-6 space-y-6 relative">
      <h2
        className="text-2xl font-semibold text-center"
        style={{ color: PALETTE.main }}
      >
        Configurar Horarios
      </h2>

      <div className="flex flex-col md:flex-row gap-6 justify-center items-start">
        {/* CALENDARIO */}
        <div
          className="bg-[#FBF7F2] p-6 rounded-xl shadow-md w-full md:w-[45%] flex flex-col items-center"
          style={{ border: `1px solid ${PALETTE.border}` }}
        >
          {/* CABECERA */}
          <div className="flex justify-between items-center mb-4 w-full">
            <button
              onClick={() => setMes((m) => (m === 0 ? 11 : m - 1))}
              className="text-[#8B6A4B] hover:text-[#C7A27A] text-lg font-semibold"
            >
              ◀
            </button>
            <span className="text-[#8B6A4B] font-bold capitalize tracking-wide text-lg">
              {nombresMes[mes]} {anio}
            </span>
            <button
              onClick={() => setMes((m) => (m === 11 ? 0 : m + 1))}
              className="text-[#8B6A4B] hover:text-[#C7A27A] text-lg font-semibold"
            >
              ▶
            </button>
          </div>

          {/* DÍAS SEMANA */}
          <div className="grid grid-cols-7 w-full mb-2">
            {["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"].map((d) => (
              <div
                key={d}
                className="text-center font-semibold text-[#6E5A49] text-sm border-b border-[#E5D8C8] pb-1"
              >
                {d}
              </div>
            ))}
          </div>

          {/* DÍAS MES */}
          <div className="grid grid-cols-7 gap-1 w-full mb-4">
            {generarDias().map((d, i) => {
              const fechaISO = d
                ? new Date(anio, mes, d).toISOString().slice(0, 10)
                : "";
              const isSelected = selectedDate === fechaISO;
              return (
                <motion.button
                  key={i}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleDateClick(d)}
                  disabled={!d}
                  className={`h-10 w-full rounded-md text-sm font-medium transition-all ${
                    !d
                      ? "bg-transparent cursor-default"
                      : isSelected
                      ? "bg-[#B08968] text-white shadow-inner"
                      : "bg-white hover:bg-[#F1E6DA] text-[#32261C]"
                  }`}
                >
                  {d ?? ""}
                </motion.button>
              );
            })}
          </div>

          {/* BOTÓN HORARIO GLOBAL */}
          <button
            onClick={() => setModalGlobal(true)}
            className="mt-3 px-6 py-2 bg-[#B08968] text-white font-semibold rounded-md shadow hover:bg-[#9C7A54] transition"
          >
            Configurar Horario Global
          </button>
        </div>

        {/* HORAS DEL DÍA */}
        <div className="flex-1 bg-[#FBF7F2] p-6 rounded-xl shadow-md border border-[#E5D8C8] min-h-[380px]">
          {!selectedDate ? (
            <p className="text-[#6E5A49] text-center mt-16 italic">
              Selecciona un día para configurar su horario.
            </p>
          ) : (
            <>
              <h3 className="text-lg font-semibold text-center mb-4 text-[#8B6A4B]">
                Horario disponible para el {selectedDate}
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {horasDelDia.map((h) => {
                  const citaOcupada = citasOcupadas.find(
                    (c) => c.horaNorm === normalizarHora(h.hora)
                  );
                  const esOcupada = Boolean(citaOcupada);

                  const estaBloqueada = bloqueosDia.some(
                    (b) => normalizarHora(b.hora) === normalizarHora(h.hora)
                  );

                  return (
                    <motion.div key={h.hora} className="relative group">
                      <motion.button
                        onClick={() => toggleHora(h.hora)}
                        whileTap={{ scale: 0.95 }}
                        disabled={esOcupada}
                        className={`relative w-full p-3 rounded-lg text-sm font-medium border transition-all overflow-hidden ${
                          esOcupada
                            ? "bg-[#F5D9A9] text-[#7A5534] border-[#E5D8C8] cursor-not-allowed"
                            : !h.disponible || estaBloqueada
                            ? "bg-[#F5E7DC] text-[#9C7A54] border-[#E5D8C8]"
                            : "bg-white text-[#32261C] border-[#E5D8C8]"
                        }`}
                      >
                        <span>{h.hora}</span>
                        {(!h.disponible || estaBloqueada) && !esOcupada && (
                          <motion.div
                            initial={{ scaleX: 0 }}
                            animate={{ scaleX: 1 }}
                            transition={{ duration: 0.3 }}
                            className="absolute left-0 top-1/2 w-full h-[2px] bg-[#9C7A54] origin-center"
                          />
                        )}
                      </motion.button>

                      {/* Tooltip para citas ocupadas */}
                      {esOcupada && (
                        <motion.div
                          initial={{ opacity: 0, y: 6 }}
                          whileHover={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.25 }}
                          className="absolute hidden group-hover:flex flex-col items-start bg-white border border-[#E5D8C8] shadow-xl rounded-lg p-3 text-xs text-left z-50 w-56 -top-[115%] left-1/2 -translate-x-1/2"
                        >
                          <p className="font-semibold text-[#7A5534] mb-1">
                            Reservada por: {citaOcupada?.paciente}
                          </p>
                          <p className="text-[#4E3B2B] mb-2">
                            Procedimiento: {citaOcupada?.procedimiento}
                          </p>
                          <button
                            type="button"
                            onClick={() => {
                              if (!citaOcupada) return;
                              const citaCompleta =
                                citasDelDia.find(
                                  (c) => c.id === citaOcupada.id
                                ) || null;
                              if (citaCompleta) setModalCita(citaCompleta);
                            }}
                            className="px-3 py-1 rounded-md bg-[#B08968] text-white hover:bg-[#9C7A54] text-xs transition"
                          >
                            Ver más
                          </button>
                        </motion.div>
                      )}
                    </motion.div>
                  );
                })}
              </div>

              <div className="flex justify-center gap-6 mt-6 text-sm text-[#6E5A49]">
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 bg-white border border-[#E5D8C8] rounded" />
                  Libre
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 bg-[#F5E7DC] border border-[#E5D8C8] rounded relative">
                    <span className="absolute top-1/2 left-0 w-full h-[2px] bg-[#9C7A54]" />
                  </span>
                  Desactivada / Bloqueada
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 bg-[#F5D9A9] border border-[#E5D8C8] rounded" />
                  Reservada (cita)
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* MODAL HORARIO GLOBAL */}
      <AnimatePresence>
        {modalGlobal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-[100]"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-[#FBF7F2] p-6 rounded-xl shadow-lg w-[90%] max-w-lg"
              style={{ border: `1px solid ${PALETTE.border}` }}
            >
              <h3 className="text-lg font-semibold text-center mb-4 text-[#8B6A4B]">
                Configurar Horario Global
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
                {horarioGlobal.map((h) => (
                  <motion.button
                    key={h.hora}
                    onClick={() => toggleHoraGlobal(h.hora)}
                    whileTap={{ scale: 0.95 }}
                    className={`relative p-3 rounded-lg text-sm font-medium border transition-all ${
                      h.disponible
                        ? "bg-white text-[#32261C] border-[#E5D8C8]"
                        : "bg-[#F5E7DC] text-[#9C7A54] border-[#E5D8C8]"
                    }`}
                  >
                    {h.hora}
                    {!h.disponible && (
                      <motion.div
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{ duration: 0.3 }}
                        className="absolute left-0 top-1/2 w-full h-[2px] bg-[#9C7A54] origin-center"
                      />
                    )}
                  </motion.button>
                ))}
              </div>

              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={() => setModalGlobal(false)}
                  className="px-6 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition"
                >
                  Cerrar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MODAL CITA */}
      <AnimatePresence>
        {modalCita && (
          <CitasAgendadasModalSimple
            cita={modalCita}
            onClose={() => setModalCita(null)}
            onUpdated={async () => {
              setModalCita(null);
              await recargarDatosDelDia();
            }}
          />
        )}
      </AnimatePresence>

      {/* TOAST */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 right-6 bg-[#8B6A4B] text-white px-5 py-3 rounded-lg shadow-lg z-[200]"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
