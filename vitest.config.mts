import { defineConfig } from 'vitest/config'
import { fileURLToPath } from 'node:url'

/*
  Alias-urile oglindesc tsconfig-ul, ca fișierele aduse din aplicație
  (`mobile/lib/rhythm/`, `mobile/components/rhythm/`) să ruleze aici fără să le
  atingem: în aplicație modulul e la `lib/rhythm/`, aici e la `src/`.
*/
const at = (path: string) => fileURLToPath(new URL(path, import.meta.url))

export default defineConfig({
  resolve: {
    alias: {
      '@/lib/rhythm': at('./src'),
      '@/components/rhythm': at('./src/components'),
      '@/lib/drums': at('./src/drums'),
      '@/components/drums': at('./src/components/drums'),
      '@/lib/guest': at('./guest'),
      '@/lib/haptics': at('./haptics'),
    },
  },
})
