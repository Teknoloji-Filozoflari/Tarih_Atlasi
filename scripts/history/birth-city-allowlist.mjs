/**
 * History birth-year map points may use only these previously reviewed
 * settlement names (representative city P625). Not an approval of new places.
 * Expanding this list requires human review; hospitals/palaces/regions stay out.
 */
export const BIRTH_CITY_ALLOWLIST = Object.freeze([
  'London',
  'Paris',
  'Berlin',
  'New York City',
  'New York',
  'Stockholm',
  'Vienna',
  'Copenhagen',
  'Warsaw',
  'Budapest',
  'Istanbul',
  'Ankara',
  'Athens',
  'Prague',
  'Tokyo',
  'Kyoto',
  'Boston',
  'Cambridge',
  'Oxford',
  'Zürich',
  'Geneva',
  'Moscow',
  'Saint Petersburg',
  'Oslo',
  'Lisbon',
  'Rome',
  'Florence',
  'Madrid',
  'Barcelona',
  'Brussels',
  'Hamburg',
  'Munich',
]);

export const birthCityAllowlist = new Set(BIRTH_CITY_ALLOWLIST);
