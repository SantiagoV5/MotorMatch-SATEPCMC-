const MOTORCYCLE_CATALOG_EVENT = 'mm:motorcycle-catalog-updated'
const MOTORCYCLE_CATALOG_STORAGE_KEY = 'mm_motorcycle_catalog_version'

export function notifyMotorcycleCatalogUpdated() {
  const version = String(Date.now())

  try {
    localStorage.setItem(MOTORCYCLE_CATALOG_STORAGE_KEY, version)
  } catch {
    // Ignore storage quota/security failures and still notify the current tab.
  }

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(MOTORCYCLE_CATALOG_EVENT, { detail: { version } }))
  }
}

export function getMotorcycleCatalogStorageKey() {
  return MOTORCYCLE_CATALOG_STORAGE_KEY
}

export function getMotorcycleCatalogEventName() {
  return MOTORCYCLE_CATALOG_EVENT
}