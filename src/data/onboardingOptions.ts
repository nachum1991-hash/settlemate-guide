import type { City } from '@/contexts/CityContext';

export interface CountryOption {
  value: string;
  label: string;
  flag: string;
}

export const onboardingCountries: CountryOption[] = [
  { value: 'israel', label: 'Israel', flag: '🇮🇱' },
  { value: 'india', label: 'India', flag: '🇮🇳' },
  { value: 'iran', label: 'Iran', flag: '🇮🇷' },
  { value: 'turkey', label: 'Turkey', flag: '🇹🇷' },
  { value: 'china', label: 'China', flag: '🇨🇳' },
  { value: 'brazil', label: 'Brazil', flag: '🇧🇷' },
  { value: 'pakistan', label: 'Pakistan', flag: '🇵🇰' },
  { value: 'usa', label: 'United States', flag: '🇺🇸' },
  { value: 'uk', label: 'United Kingdom', flag: '🇬🇧' },
  { value: 'germany', label: 'Germany', flag: '🇩🇪' },
  { value: 'france', label: 'France', flag: '🇫🇷' },
  { value: 'spain', label: 'Spain', flag: '🇪🇸' },
  { value: 'other', label: 'Other', flag: '🌍' },
];

export interface UniversityOption {
  value: string;
  label: string;
  city: City;
}

export const universities: UniversityOption[] = [
  { value: 'polimi', label: 'Politecnico di Milano', city: 'milano' },
  { value: 'unimi', label: 'Università degli Studi di Milano', city: 'milano' },
  { value: 'bocconi', label: 'Università Bocconi', city: 'milano' },
  { value: 'sapienza', label: 'Sapienza Università di Roma', city: 'roma' },
  { value: 'polito', label: 'Politecnico di Torino', city: 'torino' },
  { value: 'unito', label: 'Università di Torino', city: 'torino' },
  { value: 'unipv', label: 'Università di Pavia', city: 'pavia' },
  { value: 'other', label: 'Other', city: 'milano' },
];

export const universityToCity = (uni: string | null | undefined): City | null => {
  if (!uni) return null;
  return universities.find((u) => u.value === uni)?.city ?? null;
};

export const countryLabel = (value: string | null | undefined) =>
  onboardingCountries.find((c) => c.value === value)?.label ?? value ?? '';

export const countryFlag = (value: string | null | undefined) =>
  onboardingCountries.find((c) => c.value === value)?.flag ?? '🌍';
