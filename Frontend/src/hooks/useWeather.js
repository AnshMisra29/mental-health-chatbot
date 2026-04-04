import { useQuery } from "@tanstack/react-query";
import { Sun, Cloud, CloudRain, CloudSnow, CloudLightning } from "lucide-react";

const fetchWeather = async () => {
  // 1. Get location based on IP
  const locationRes = await fetch("https://get.geojs.io/v1/ip/geo.json");
  if (!locationRes.ok) throw new Error("Failed to fetch location");
  const locationData = await locationRes.json();
  const { city, latitude, longitude } = locationData;

  if (!latitude || !longitude) throw new Error("Location coordinates missing");

  // 2. Get weather using Open-Meteo
  const weatherRes = await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`,
  );
  if (!weatherRes.ok) throw new Error("Failed to fetch weather");
  const weatherData = await weatherRes.json();
  const current = weatherData.current_weather;

  // 3. Map WMO weather code
  let condition = "Clear";
  let icon = Sun;
  let color = "text-amber-500";

  const code = current.weathercode;
  if (code === 0) {
    condition = "Clear";
    icon = Sun;
    color = "text-amber-500";
  } else if (code >= 1 && code <= 3) {
    condition = "Partly Cloudy";
    icon = Cloud;
    color = "text-slate-400";
  } else if (code >= 45 && code <= 48) {
    condition = "Foggy";
    icon = Cloud;
    color = "text-slate-400";
  } else if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) {
    condition = "Rain";
    icon = CloudRain;
    color = "text-blue-400";
  } else if ((code >= 71 && code <= 77) || code === 85 || code === 86) {
    condition = "Snow";
    icon = CloudSnow;
    color = "text-sky-200";
  } else if (code >= 95 && code <= 99) {
    condition = "Thunderstorm";
    icon = CloudLightning;
    color = "text-purple-500";
  }

  return {
    temp: Math.round(current.temperature),
    condition,
    city: city || "Unknown Location",
    icon,
    color,
  };
};

export const useWeather = () => {
  return useQuery({
    queryKey: ["weather"],
    queryFn: fetchWeather,
    staleTime: 0, // Always check in background
    retry: 2,
  });
};
