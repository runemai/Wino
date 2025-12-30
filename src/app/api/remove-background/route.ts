import { NextResponse, type NextRequest } from "next/server";

export const runtime = "nodejs";

/**
 * Fjerner baggrunden fra et billede ved hjælp af Remove.bg API
 * Hvis API key ikke er sat op, returnerer vi original billedet
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof Blob)) {
      return NextResponse.json(
        { error: "Intet billedfil modtaget." },
        { status: 400 },
      );
    }

    const REMOVE_BG_API_KEY = process.env.REMOVE_BG_API_KEY;

    // Hvis API key ikke er sat op, returner original billedet
    if (!REMOVE_BG_API_KEY) {
      console.warn("REMOVE_BG_API_KEY ikke sat op, returnerer original billede");
      return new NextResponse(file, {
        headers: {
          "Content-Type": file.type || "image/png",
        },
      });
    }

    // Konverter blob til buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // Kald Remove.bg API
    const requestFormData = new FormData();
    // Remove.bg forventer en File eller Blob
    const imageFile = new File([buffer], "image.jpg", { type: file.type || "image/jpeg" });
    requestFormData.append("image_file", imageFile);
    requestFormData.append("size", "auto");

    const removeBgResponse = await fetch(
      "https://api.remove.bg/v1.0/removebg",
      {
        method: "POST",
        headers: {
          "X-Api-Key": REMOVE_BG_API_KEY,
        },
        body: requestFormData,
      },
    );

    if (!removeBgResponse.ok) {
      const errorText = await removeBgResponse.text();
      console.error("Remove.bg API fejl:", errorText);
      // Returner original hvis API fejler
      return new NextResponse(file, {
        headers: {
          "Content-Type": file.type || "image/png",
        },
      });
    }

    const resultBlob = await removeBgResponse.blob();

    return new NextResponse(resultBlob, {
      headers: {
        "Content-Type": "image/png",
      },
    });
  } catch (error) {
    console.error("Baggrundsfjerning fejl:", error);
    
    // Returner original billedet hvis noget fejler
    const formData = await request.formData();
    const file = formData.get("file");
    if (file instanceof Blob) {
      return new NextResponse(file, {
        headers: {
          "Content-Type": file.type || "image/png",
        },
      });
    }

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Uventet fejl ved baggrundsfjerning",
      },
      { status: 500 },
    );
  }
}

