import { useEffect, useRef, useState } from "react";
import { MapPin, Navigation, Phone, Clock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix default marker icon issue with Leaflet + Vite
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

interface Location {
  id: number;
  name: string;
  type: string;
  lat: number;
  lng: number;
  address: string;
  hours?: string;
  phone?: string;
  accepts?: string[];
  capacity?: string;
}

const InteractiveMap = () => {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const canvasRendererRef = useRef<L.Canvas | null>(null);
  const [locations, setLocations] = useState<Location[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [activeFilters, setActiveFilters] = useState<string[]>([
    "recycling",
    "ewaste",
    "hospital",
    "shelter",
  ]);
  const [loading, setLoading] = useState(false);

  const filterTypes = [
    { id: "recycling", label: "Recycling Centers", color: "#10b981", icon: "♻️" },
    { id: "ewaste", label: "E-Waste Points", color: "#3b82f6", icon: "🔋" },
    { id: "hospital", label: "Hospitals", color: "#ef4444", icon: "🏥" },
    { id: "shelter", label: "Flood Shelters", color: "#f59e0b", icon: "🛡️" },
  ];

  // Load nationwide data from OpenStreetMap Overpass API (fallback to bundled JSON)
  const fetchOverpassNationwide = async (): Promise<Location[]> => {
    const query = `
      [out:json][timeout:120];
      area["ISO3166-1"="MY"][admin_level=2]->.searchArea;
      (
        node["amenity"="hospital"](area.searchArea);
        way["amenity"="hospital"](area.searchArea);
        relation["amenity"="hospital"](area.searchArea);

        node["amenity"="recycling"](area.searchArea);
        way["amenity"="recycling"](area.searchArea);
        relation["amenity"="recycling"](area.searchArea);

        node["emergency"="shelter"](area.searchArea);
        way["emergency"="shelter"](area.searchArea);
        relation["emergency"="shelter"](area.searchArea);

        node["amenity"="shelter"](area.searchArea);
        way["amenity"="shelter"](area.searchArea);
        relation["amenity"="shelter"](area.searchArea);
      );
      out center;
    `;
    const resp = await fetch("https://overpass-api.de/api/interpreter", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8" },
      body: `data=${encodeURIComponent(query)}`,
    });
    if (!resp.ok) throw new Error(`Overpass error ${resp.status}`);
    const data = await resp.json();
    const elements = Array.isArray(data?.elements) ? data.elements : [];

    const toLocation = (el: any, idx: number): Location | null => {
      const tags = el.tags || {};
      const lat = el.lat ?? el.center?.lat;
      const lng = el.lon ?? el.center?.lon;
      if (typeof lat !== "number" || typeof lng !== "number") return null;

      let type: string | null = null;
      if (tags.amenity === "hospital") type = "hospital";
      else if (tags.amenity === "recycling") {
        const isEwaste =
          tags["recycling:electronics"] === "yes" ||
          tags["recycling:electrical_items"] === "yes" ||
          tags["recycling:batteries"] === "yes";
        type = isEwaste ? "ewaste" : "recycling";
      } else if (
        tags.emergency === "shelter" ||
        (tags.amenity === "shelter" && tags.shelter_type !== "public_transport" && tags.shelter_type !== "weather_shelter")
      ) {
        type = "shelter";
      }

      if (!type) return null;

      const address =
        tags["addr:full"] ||
        [tags["addr:housenumber"], tags["addr:street"], tags["addr:city"], tags["addr:state"]]
          .filter(Boolean)
          .join(", ") ||
        "Malaysia";

      const accepts: string[] | undefined =
        type === "recycling" || type === "ewaste"
          ? ([
              tags["recycling:glass"] === "yes" && "glass",
              tags["recycling:paper"] === "yes" && "paper",
              tags["recycling:plastic"] === "yes" && "plastic",
              tags["recycling:metal"] === "yes" && "metal",
              tags["recycling:cardboard"] === "yes" && "cardboard",
              (tags["recycling:electronics"] === "yes" || tags["recycling:electrical_items"] === "yes") && "electronics",
              tags["recycling:batteries"] === "yes" && "batteries",
            ].filter(Boolean) as string[])
          : undefined;

      return {
        id: el.id ?? idx,
        name: tags.name || (type === "hospital" ? "Hospital" : type === "shelter" ? "Shelter" : "Recycling Point"),
        type,
        lat,
        lng,
        address,
        hours: tags.opening_hours,
        phone: tags.phone || tags["contact:phone"],
        accepts,
      };
    };

    const out: Location[] = [];
    for (let i = 0; i < elements.length; i++) {
      const loc = toLocation(elements[i], i);
      if (loc) out.push(loc);
    }
    return out;
  };

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        setLoading(true);
        const nationwide = await fetchOverpassNationwide();
        if (!cancelled && nationwide.length) {
          setLocations(nationwide);
          return;
        }
      } catch (e) {
        console.warn("Nationwide data failed, falling back to bundled locations:", e);
      } finally {
        setLoading(false);
      }

      fetch(`${import.meta.env.BASE_URL}data/locations.json`)
        .then((res) => res.json())
        .then((data) => {
          if (!cancelled) setLocations(data);
        })
        .catch((err) => console.error("Failed to load locations:", err));
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    // Initialize map
    const map = L.map(mapContainerRef.current).setView([4.2105, 101.9758], 7);
    mapRef.current = map;
    // High-performance canvas renderer for many points
    canvasRendererRef.current = L.canvas({ padding: 0.5 });

    // Add tile layer
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current || locations.length === 0) return;

    // Remove previous markers layer, if any
    if (markersLayerRef.current) {
      mapRef.current.removeLayer(markersLayerRef.current);
      markersLayerRef.current = null;
    }

    const group = L.layerGroup();
    group.addTo(mapRef.current);
    markersLayerRef.current = group;

    // Add markers for filtered locations using a high-performance canvas renderer
    const filteredLocations = locations.filter((loc) =>
      activeFilters.includes(loc.type)
    );

    const batchSize = 300;
    const addBatch = (start: number) => {
      const end = Math.min(start + batchSize, filteredLocations.length);
      for (let i = start; i < end; i++) {
        const location = filteredLocations[i];
        const markerColor =
          filterTypes.find((f) => f.id === location.type)?.color || "#10b981";

        const circle = L.circleMarker([location.lat, location.lng], {
          renderer: canvasRendererRef.current || undefined,
          radius: 6,
          color: "#ffffff",
          weight: 1,
          fillColor: markerColor,
          fillOpacity: 0.9,
        })
          .addTo(group)
          .on("click", () => {
            setSelectedLocation(location);
            mapRef.current?.setView([location.lat, location.lng], 12);
          });

        circle.bindPopup(`<strong>${location.name}</strong><br>${location.address}`);
      }
      if (end < filteredLocations.length) {
        requestAnimationFrame(() => addBatch(end));
      }
    };

    addBatch(0);
  }, [locations, activeFilters]);

  const toggleFilter = (filterId: string) => {
    setActiveFilters((prev) =>
      prev.includes(filterId)
        ? prev.filter((id) => id !== filterId)
        : [...prev, filterId]
    );
  };

  const getDirections = (location: Location) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${location.lat},${location.lng}`;
    window.open(url, "_blank");
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-8">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          Interactive Map
        </h1>
        <p className="text-lg text-muted-foreground">
          Find recycling centers, e-waste points, hospitals, and emergency shelters
        </p>
      </div>

      {/* Filters */}
      <Card className="p-4 mb-6 shadow-custom-md">
        <div className="flex flex-wrap gap-2">
          {filterTypes.map((filter) => (
            <Button
              key={filter.id}
              onClick={() => toggleFilter(filter.id)}
              variant={activeFilters.includes(filter.id) ? "default" : "outline"}
              size="sm"
              className={activeFilters.includes(filter.id) ? "gradient-primary" : ""}
            >
              <span className="mr-2">{filter.icon}</span>
              {filter.label}
            </Button>
          ))}
        </div>
      </Card>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Map */}
        <div className="lg:col-span-2">
          <Card className="overflow-hidden shadow-custom-lg">
            <div ref={mapContainerRef} className="w-full h-[600px]" />
          </Card>
        </div>

        {/* Location Details */}
        <div className="space-y-6">
          {selectedLocation ? (
            <Card className="p-6 shadow-custom-lg animate-scale-in">
              <h2 className="text-2xl font-bold mb-4 break-words">{selectedLocation.name}</h2>
              
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <MapPin className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <p className="text-muted-foreground text-sm break-words">{selectedLocation.address}</p>
                </div>

                {selectedLocation.hours && (
                  <div className="flex items-start space-x-3">
                    <Clock className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <p className="text-muted-foreground">{selectedLocation.hours}</p>
                  </div>
                )}

                {selectedLocation.phone && (
                  <div className="flex items-start space-x-3">
                    <Phone className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <p className="text-muted-foreground">{selectedLocation.phone}</p>
                  </div>
                )}

                {selectedLocation.accepts && (
                  <div className="pt-3 border-t">
                    <p className="font-semibold mb-2">Accepts:</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedLocation.accepts.map((item, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {selectedLocation.capacity && (
                  <div className="pt-3 border-t">
                    <p className="font-semibold">Capacity: {selectedLocation.capacity}</p>
                  </div>
                )}
              </div>

              <Button
                onClick={() => getDirections(selectedLocation)}
                className="w-full mt-6 gradient-primary"
              >
                <Navigation className="mr-2" size={18} />
                Get Directions
              </Button>
            </Card>
          ) : (
            <Card className="p-6 shadow-custom-lg">
              <p className="text-center text-muted-foreground">
                Click on a marker to view details
              </p>
            </Card>
          )}

          {/* Legend */}
          <Card className="p-6 shadow-custom-md">
            <h3 className="font-semibold mb-4">Legend</h3>
            <div className="space-y-2">
              {filterTypes.map((filter) => (
                <div key={filter.id} className="flex items-center space-x-3">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: filter.color }}
                  />
                  <span className="text-sm text-muted-foreground">{filter.label}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default InteractiveMap;
