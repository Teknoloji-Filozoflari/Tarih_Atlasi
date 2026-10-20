/** Approved local physical provider. Enabling a remote service requires a separate rights review. */
export const physicalProvider = Object.freeze({
  id: 'natural-earth-physical-land',
  version: '5.1.2',
  dataLicense: 'public domain',
  licenseURL: 'https://www.naturalearthdata.com/about/terms-of-use/',
  attribution: 'Made with Natural Earth.',
  sources: {
    coarse: {
      scale: '1:110000000',
      url: 'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/v5.1.2/geojson/ne_110m_land.geojson',
    },
    detail: {
      scale: '1:50000000',
      url: 'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/v5.1.2/geojson/ne_50m_land.geojson',
    },
  },
  physicalDetailVersion: '5.1.2-10m',
  styleURL: null,
  tileURL: null,
  requiresKey: false,
  remoteRequests: false,
  cachePolicy: 'versioned-bundled-assets',
  rateLimit: 'no-runtime-requests',
  cors: 'no-cross-origin-runtime-fetch',
  available: ['land', 'coastline', 'lakes', 'rivers'],
  unavailable: ['relief', 'physical-labels', 'street-detail'],
  historicalCoastline: false,
  politicalLabels: false,
});
