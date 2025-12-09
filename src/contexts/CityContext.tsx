import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type City = 'milano' | 'roma' | 'torino' | 'pavia';

export interface CityInfo {
  id: City;
  name: string;
  emoji: string;
}

export const cities: CityInfo[] = [
  { id: 'milano', name: 'Milano', emoji: '🏰' },
  { id: 'roma', name: 'Roma', emoji: '🏛️' },
  { id: 'torino', name: 'Torino', emoji: '⛰️' },
  { id: 'pavia', name: 'Pavia', emoji: '🎓' },
];

interface CityContextType {
  selectedCity: City;
  setSelectedCity: (city: City) => void;
  cityInfo: CityInfo;
}

const CityContext = createContext<CityContextType | undefined>(undefined);

export const CityProvider = ({ children }: { children: ReactNode }) => {
  const [selectedCity, setSelectedCity] = useState<City>(() => {
    const stored = localStorage.getItem('selectedCity');
    return (stored as City) || 'milano';
  });

  useEffect(() => {
    localStorage.setItem('selectedCity', selectedCity);
  }, [selectedCity]);

  const cityInfo = cities.find(c => c.id === selectedCity) || cities[0];

  return (
    <CityContext.Provider value={{ selectedCity, setSelectedCity, cityInfo }}>
      {children}
    </CityContext.Provider>
  );
};

export const useCity = () => {
  const context = useContext(CityContext);
  if (!context) {
    throw new Error('useCity must be used within a CityProvider');
  }
  return context;
};
