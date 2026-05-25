import { useEffect } from 'react'
import { syncPopularRankingNotifications } from '../services/motorcycleNotifications'

export function useMotorcycleNotifications(topMotorcycles = []) {
  useEffect(() => {
    syncPopularRankingNotifications(topMotorcycles)
  }, [topMotorcycles])
}
