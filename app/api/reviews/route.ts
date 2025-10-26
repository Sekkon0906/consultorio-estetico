import { NextResponse } from "next/server";

export async function GET() {
  const placeId = process.env.GOOGLE_PLACE_ID;
  const apiKey = process.env.GOOGLE_API_KEY;

  if (!placeId || !apiKey) {
    return NextResponse.json(
      { error: "Missing Google API credentials" },
      { status: 500 }
    );
  }

  const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=reviews,rating,user_ratings_total&key=${apiKey}`;

  try {
    const res = await fetch(url);
    const data = await res.json();

    if (data.status !== "OK") {
      console.error("Google API error:", data);
      return NextResponse.json({ error: data.status }, { status: 500 });
    }

    const reviews = data.result.reviews?.map((r: any, index: number) => ({
      id: index,
      nombre: r.author_name,
      foto: r.profile_photo_url,
      comentario: r.text,
      estrellas: r.rating,
      procedimiento: "Paciente verificado",
    }));

    return NextResponse.json(reviews);
  } catch (error) {
    console.error("Error al conectar con Google API:", error);
    return NextResponse.json(
      { error: "Error de conexión con el servidor" },
      { status: 500 }
    );
  }
}
