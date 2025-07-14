import React, { useEffect } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface MapProps {
  center: [number, number];
  recyclingCenters: any[];
  radius: number;
}

const Map: React.FC<MapProps> = ({ center, recyclingCenters, radius }) => {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const map = L.map('map').setView(center, 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // Add user location marker
    L.circleMarker(center, {
      radius: 8,
      fillColor: "#3b82f6",
      color: "#fff",
      weight: 2,
      opacity: 1,
      fillOpacity: 0.8
    }).addTo(map).bindPopup("Your location").openPopup();

    // Add search radius circle
    L.circle(center, {
      color: "#3b82f6",
      fillColor: "#3b82f6",
      fillOpacity: 0.1,
      radius: radius
    }).addTo(map);

    // Add recycling centers
    recyclingCenters.forEach(center => {
      if (!center.latitude || !center.longitude) return;
      
      const icon = L.divIcon({
        html: `<div class="relative w-6 h-6 flex items-center justify-center">
          <div class="absolute w-5 h-5 bg-green-500 rounded-full animate-ping opacity-75"></div>
          <div class="relative w-4 h-4 bg-green-600 rounded-full"></div>
        </div>`,
        className: '',
        iconSize: [24, 24]
      });

      const marker = L.marker([center.latitude, center.longitude], { icon })
        .addTo(map)
        .bindPopup(`
          <div class="text-gray-800">
            <h3 class="font-bold">${center.name || 'Recycling Center'}</h3>
            <p class="text-sm">${center.address || ''}</p>
            ${center.accepted_materials?.length > 0 ? `
              <div class="mt-2">
                <h4 class="text-xs font-bold">Accepts:</h4>
                <div class="flex flex-wrap gap-1 mt-1">
                  ${center.accepted_materials.map((m: string) => `
                    <span class="text-xs px-2 py-1 bg-gray-100 rounded-full">${m}</span>
                  `).join('')}
                </div>
              </div>
            ` : ''}
          </div>
        `);
    });

    return () => {
      map.remove();
    };
  }, [center, recyclingCenters, radius]);

  return <div id="map" className="h-full w-full rounded-xl" />;
};

export default Map;