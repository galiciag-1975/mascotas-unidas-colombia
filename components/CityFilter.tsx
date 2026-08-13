"use client";

import { CIUDADES_COLOMBIA } from "@/lib/cities";

interface CityFilterProps {
  value: string;
  onChange: (ciudad: string) => void;
  id?: string;
  placeholder?: string;
  required?: boolean;
}

// Input de ciudad con sugerencias (datalist): permite elegir una ciudad
// común o escribir cualquier municipio que no esté en la lista.
export default function CityFilter({
  value,
  onChange,
  id = "ciudad",
  placeholder = "Ej: Pereira",
  required = false,
}: CityFilterProps) {
  return (
    <>
      <input
        id={id}
        list={`${id}-lista`}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
      />
      <datalist id={`${id}-lista`}>
        {CIUDADES_COLOMBIA.map((ciudad) => (
          <option key={ciudad} value={ciudad} />
        ))}
      </datalist>
    </>
  );
}
