import type { NavItemType } from '../types/nav_public'

export const navLinks: NavItemType[] = [
  { name: 'Beranda', url: '/' },
  {
    name: 'Profil',
    children: [
      { name: 'Struktur Organisasi', url: '/profile/organization-structure' },
      { name: 'Rencana Strategis', url: '/profile/strategy-plan' },
      { name: 'Tugas & Fungsi', url: '/profile/tasks-functions' },
    ],
  },
  { name: 'Layanan', children: [{ name: 'Bantuan', url: '/services/help' }] },
  { name: 'Artikel', url: '/articles' },
  { name: 'Berita', url: '/news' },
  { name: 'Peraturan', url: '/regulations' },
  {
    name: 'Data Jakon',
    children: [
      { name: 'Asosiasi', url: '/construction-service/association' },
      { name: 'Paket Pekerjaan', url: '/construction-service/work-package' },
    ],
  },
  { name: 'Pelatihan', url: '/training' },
  // { name: "Pengawasan", children: [
  //     { name: "Kecelakaan", url: "/monitoring/accident" },
  // ]},
]
