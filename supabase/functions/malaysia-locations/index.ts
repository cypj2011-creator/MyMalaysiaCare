import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface LocationResult {
  name: string;
  type: "hospital" | "recycling" | "ewaste";
  lat: number;
  lng: number;
  address: string;
  hours?: string;
  phone?: string;
  accepts?: string[];
}

const endpoints = [
  "https://overpass.kumi.systems/api/interpreter",
  "https://overpass-api.de/api/interpreter",
  "https://overpass.openstreetmap.ru/api/interpreter",
];

const isValidBbox = (bbox: unknown) =>
  typeof bbox === "string" &&
  bbox.split(",").length === 4 &&
  bbox.split(",").every((part) => Number.isFinite(Number(part.trim())));

const fetchWithTimeout = async (url: string, body: string, timeoutMs = 22000) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8" },
      body,
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeoutId);
  }
};

const toLocation = (el: any): LocationResult | null => {
  const tags = el.tags || {};
  const lat = el.lat ?? el.center?.lat;
  const lng = el.lon ?? el.center?.lon;
  if (typeof lat !== "number" || typeof lng !== "number") return null;

  let type: LocationResult["type"] | null = null;
  if (tags.amenity === "hospital" || tags.amenity === "clinic") type = "hospital";
  if (tags.amenity === "recycling") {
    const isEwaste =
      tags["recycling:electronics"] === "yes" ||
      tags["recycling:electrical_items"] === "yes" ||
      tags["recycling:batteries"] === "yes";
    type = isEwaste ? "ewaste" : "recycling";
  }
  if (!type) return null;

  const accepts = type === "hospital" ? undefined : ([
    tags["recycling:glass"] === "yes" && "glass",
    tags["recycling:paper"] === "yes" && "paper",
    tags["recycling:plastic"] === "yes" && "plastic",
    tags["recycling:metal"] === "yes" && "metal",
    tags["recycling:cardboard"] === "yes" && "cardboard",
    (tags["recycling:electronics"] === "yes" || tags["recycling:electrical_items"] === "yes") && "electronics",
    tags["recycling:batteries"] === "yes" && "batteries",
  ].filter(Boolean) as string[]);

  return {
    name: tags.name || (type === "hospital" ? "Hospital / Clinic" : "Recycling Point"),
    type,
    lat,
    lng,
    address:
      tags["addr:full"] ||
      [tags["addr:housenumber"], tags["addr:street"], tags["addr:city"], tags["addr:state"]]
        .filter(Boolean)
        .join(", ") ||
      "Malaysia",
    hours: tags.opening_hours,
    phone: tags.phone || tags["contact:phone"],
    accepts,
  };
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { bbox } = await req.json();
    if (!isValidBbox(bbox)) {
      return new Response(JSON.stringify({ locations: [] }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const query = `
      [out:json][timeout:25];
      (
        node["amenity"="hospital"](${bbox});
        way["amenity"="hospital"](${bbox});
        relation["amenity"="hospital"](${bbox});
        node["amenity"="clinic"](${bbox});
        way["amenity"="clinic"](${bbox});
        relation["amenity"="clinic"](${bbox});
        node["amenity"="recycling"](${bbox});
        way["amenity"="recycling"](${bbox});
        relation["amenity"="recycling"](${bbox});
      );
      out center 10000;
    `;

    let response: Response | null = null;
    for (const endpoint of endpoints) {
      try {
        const next = await fetchWithTimeout(endpoint, `data=${encodeURIComponent(query)}`);
        if (next.ok) {
          response = next;
          break;
        }
      } catch (_) {
        continue;
      }
    }

    if (!response) {
      return new Response(JSON.stringify({ locations: [] }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json().catch(() => null);
    const elements = Array.isArray(data?.elements) ? data.elements : [];
    const locations = elements.map(toLocation).filter(Boolean);

    return new Response(JSON.stringify({ locations }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Malaysia locations error:", error);
    return new Response(JSON.stringify({ locations: [] }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});