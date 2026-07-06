import { createFileRoute, Link } from '@tanstack/react-router'
import { useEffect, useState } from 'react'

import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Autoplay } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'

export const Route = createFileRoute('/_public/')({
  component: RouteComponent,
})

function RouteComponent() {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Wait for CSS to load and DOM to be ready
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 300) // Adjust delay as needed

    return () => clearTimeout(timer)
  }, [])

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white">
        <div className="text-center">
          {/* Spinner */}
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-secondary border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]">
            <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
              Loading...
            </span>
          </div>
          {/* Loading Text */}
          <p className="mt-4 text-sm font-medium text-slate-600">Loading...</p>
        </div>
      </div>
    )
  }
  
  return (
    <div className="bg-slate-50 text-slate-900 antialiased">
      {/* Navigation */}
      <nav className="fixed top-0 z-50 w-full border-b border-slate-200/60 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold tracking-tighter text-primary">ANB</span>
            <div className="h-4 w-[1px] bg-slate-300"></div>
            <span className="text-xs font-medium uppercase tracking-widest text-slate-500">Ahmad Nadhif</span>
          </div>
          
          <div className="hidden items-center gap-8 md:flex">
            <a href="#beranda" className="text-sm font-medium text-slate-600 transition-colors hover:text-secondary">
              Beranda
            </a>
            <a href="#program" className="text-sm font-medium text-slate-600 transition-colors hover:text-secondary">
              Program
            </a>
            <a href="#keunggulan" className="text-sm font-medium text-slate-600 transition-colors hover:text-secondary">
              Keunggulan
            </a>
            <a href="#testimoni" className="text-sm font-medium text-slate-600 transition-colors hover:text-secondary">
              Testimoni
            </a>
          </div>

          <div className="flex items-center gap-4">
            <Link 
              to="/login" 
              className="inline-flex items-center justify-center rounded-full bg-primary px-6 py-2 text-sm font-medium text-white transition-all hover:opacity-90"
            >
              Login
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="beranda" className="relative flex min-h-screen items-center justify-center overflow-hidden pt-20">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(45%_45%_at_50%_50%,rgba(0,175,129,0.08)_0%,rgba(255,255,255,0)_100%)]"></div>
        <div className="mx-auto max-w-7xl px-6 py-24 text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-secondary/20 bg-secondary/5 px-4 py-1.5 text-xs font-medium text-secondary">
            <i className="iconify" data-icon="solar:star-fall-linear" data-width="16"></i>
            Bimbingan Belajar Kedinasan Terbaik
          </div>
          <h1 className="mx-auto max-w-4xl text-5xl font-semibold tracking-tight text-primary md:text-7xl">
            Wujudkan Impian Menjadi <span className="text-secondary">Abdi Negara</span> Bersama Kami.
          </h1>
          <p className="mx-auto mt-8 max-w-2xl text-lg text-slate-600">
            Persiapan intensif menghadapi seleksi Akpol, Akmil, CPNS, dan Sekolah Kedinasan lainnya dengan metode pembelajaran terukur dan pengajar berpengalaman.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <a 
              href="#program" 
              className="inline-flex h-12 items-center justify-center rounded-full bg-secondary px-8 text-sm font-medium text-white transition-transform hover:scale-105 active:scale-95"
            >
              Lihat Program Kami
            </a>
            <a 
              href="https://wa.me/628123456789" 
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-8 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
            >
              <i className="iconify" data-icon="solar:phone-calling-linear" data-width="18"></i>
              Konsultasi Gratis
            </a>
          </div>

          {/* Stats Section */}
          <div className="mt-16 grid grid-cols-1 gap-8 border-t border-slate-200/60 pt-12 sm:grid-cols-3">
            <div className="flex flex-col items-center gap-2">
              <span className="text-4xl font-bold text-primary">5,000+</span>
              <span className="text-sm font-medium text-slate-500">Siswa Terdaftar</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <span className="text-4xl font-bold text-primary">150+</span>
              <span className="text-sm font-medium text-slate-500">Kelas Terdaftar</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <span className="text-4xl font-bold text-primary">100,000+</span>
              <span className="text-sm font-medium text-slate-500">Ujian Telah Dilakukan</span>
            </div>
          </div>
        </div>
      </section>

      {/* Program Section */}
      <section id="program" className="bg-white py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-16 flex flex-col items-end justify-between gap-4 border-b border-slate-100 pb-8 md:flex-row">
            <div className="max-w-xl text-left">
              <h2 className="text-3xl font-semibold tracking-tight text-primary">Program Unggulan</h2>
              <p className="mt-4 text-slate-600">
                Kami menyediakan kurikulum khusus yang disesuaikan dengan standar kelulusan tes seleksi terbaru.
              </p>
            </div>
            <div className="flex gap-2">
              <div className="h-2 w-12 rounded-full bg-secondary"></div>
              <div className="h-2 w-2 rounded-full bg-slate-200"></div>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {/* Program Card 1 */}
            <div className="group relative overflow-hidden rounded-3xl border border-slate-100 bg-slate-50 p-8 transition-all hover:border-secondary/20 hover:bg-white hover:shadow-xl hover:shadow-secondary/5">
              <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-white">
                <i className="iconify" data-icon="solar:shield-user-linear" data-width="24"></i>
              </div>
              <h3 className="text-xl font-semibold tracking-tight text-primary">AKPOL & AKMIL</h3>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">
                Persiapan fisik, psikotes, dan akademik mendalam untuk seleksi masuk TNI dan POLRI.
              </p>
              <ul className="mt-6 space-y-3 text-xs text-slate-500">
                <li className="flex items-center gap-2">
                  <i className="iconify text-secondary" data-icon="solar:check-circle-linear"></i> 
                  Latihan CAT Berkala
                </li>
                <li className="flex items-center gap-2">
                  <i className="iconify text-secondary" data-icon="solar:check-circle-linear"></i> 
                  Pendampingan Jasmani
                </li>
              </ul>
            </div>

            {/* Program Card 2 */}
            <div className="group relative overflow-hidden rounded-3xl border border-slate-100 bg-slate-50 p-8 transition-all hover:border-secondary/20 hover:bg-white hover:shadow-xl hover:shadow-secondary/5">
              <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary text-white">
                <i className="iconify" data-icon="solar:case-linear" data-width="24"></i>
              </div>
              <h3 className="text-xl font-semibold tracking-tight text-primary">CPNS & PPPK</h3>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">
                Bedah materi TIU, TWK, dan TKP secara komprehensif dengan trik menjawab cepat.
              </p>
              <ul className="mt-6 space-y-3 text-xs text-slate-500">
                <li className="flex items-center gap-2">
                  <i className="iconify text-secondary" data-icon="solar:check-circle-linear"></i> 
                  Ribuan Bank Soal
                </li>
                <li className="flex items-center gap-2">
                  <i className="iconify text-secondary" data-icon="solar:check-circle-linear"></i> 
                  Update Kisi-kisi Terbaru
                </li>
              </ul>
            </div>

            {/* Program Card 3 */}
            <div className="group relative overflow-hidden rounded-3xl border border-slate-100 bg-slate-50 p-8 transition-all hover:border-secondary/20 hover:bg-white hover:shadow-xl hover:shadow-secondary/5">
              <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-white">
                <i className="iconify" data-icon="solar:diploma-linear" data-width="24"></i>
              </div>
              <h3 className="text-xl font-semibold tracking-tight text-primary">Sekolah Kedinasan</h3>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">
                Bimbingan intensif masuk STAN, IPDN, STIS, dan instansi kedinasan favorit lainnya.
              </p>
              <ul className="mt-6 space-y-3 text-xs text-slate-500">
                <li className="flex items-center gap-2">
                  <i className="iconify text-secondary" data-icon="solar:check-circle-linear"></i> 
                  Simulasi Real-Time
                </li>
                <li className="flex items-center gap-2">
                  <i className="iconify text-secondary" data-icon="solar:check-circle-linear"></i> 
                  Konseling Jurusan
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Why Us Section */}
      <section id="keunggulan" className="bg-primary py-24 text-white">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid items-center gap-16 lg:grid-cols-2">
            <div>
              <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
                Mengapa Memilih Ahmad Nadhif Bimbel?
              </h2>
              <p className="mt-6 text-slate-300">
                Kami bukan sekadar tempat belajar, tapi partner perjalanan karir Anda menuju masa depan yang gemilang sebagai aparatur negara.
              </p>
              
              <div className="mt-12 space-y-8">
                <div className="flex gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary/20 text-secondary">
                    <i className="iconify" data-icon="solar:medal-star-linear" data-width="20"></i>
                  </div>
                  <div>
                    <h4 className="font-medium">Pengajar Profesional</h4>
                    <p className="mt-1 text-sm text-slate-400">
                      Dibimbing langsung oleh praktisi dan akademisi yang ahli di bidangnya.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary/20 text-secondary">
                    <i className="iconify" data-icon="solar:graph-up-linear" data-width="20"></i>
                  </div>
                  <div>
                    <h4 className="font-medium">Sistem Monitoring Progres</h4>
                    <p className="mt-1 text-sm text-slate-400">
                      Pantau perkembangan hasil belajar dan simulasi tryout secara berkala melalui sistem kami.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary/20 text-secondary">
                    <i className="iconify" data-icon="solar:users-group-two-rounded-linear" data-width="20"></i>
                  </div>
                  <div>
                    <h4 className="font-medium">Kelas Interaktif</h4>
                    <p className="mt-1 text-sm text-slate-400">
                      Jumlah siswa per kelas dibatasi untuk memastikan fokus bimbingan maksimal.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square rounded-3xl bg-secondary/10 p-4">
                <div className="h-full w-full overflow-hidden rounded-2xl border border-white/10">
                  <img src="/images/gambar4.jpeg" alt="Keunggulan Bimbel" className="h-full w-full object-cover" />
                </div>
              </div>
              <div className="absolute -bottom-6 -left-6 rounded-2xl bg-secondary p-6 shadow-2xl">
                <div className="text-3xl font-bold">95%</div>
                <div className="text-xs font-medium uppercase tracking-wider text-primary/80">Tingkat Kelulusan</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section id="galeri" className="bg-slate-50 py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-16 text-center">
            <h2 className="text-3xl font-semibold tracking-tight text-primary">Galeri Kegiatan</h2>
            <p className="mt-4 text-slate-600">Dokumentasi kegiatan belajar mengajar kami.</p>
          </div>
          <div className="relative">
            <Swiper
              modules={[Navigation, Autoplay]}
              spaceBetween={24}
              slidesPerView={1}
              breakpoints={{
                640: { slidesPerView: 2 },
                1024: { slidesPerView: 3 },
                1280: { slidesPerView: 4 },
              }}
              loop={true}
              navigation={{
                prevEl: '.custom-swiper-prev',
                nextEl: '.custom-swiper-next',
              }}
              autoplay={{ delay: 3000, disableOnInteraction: false }}
              className="w-full !pb-8"
            >
              {[1, 2, 3, 4, 5, 6].map((num) => (
                <SwiperSlide key={num}>
                  <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                    <img 
                      src={`/images/gambar${num}.jpeg`} 
                      alt={`Galeri ${num}`} 
                      className="aspect-[4/3] w-full object-cover transition-transform duration-500 hover:scale-110" 
                    />
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
            
            {/* Custom Navigation Buttons */}
            <button className="custom-swiper-prev absolute -left-5 top-[calc(50%-16px)] z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white text-primary shadow-[0_4px_12px_rgba(0,0,0,0.1)] ring-1 ring-slate-900/5 transition-all hover:scale-110 hover:bg-[#214545] hover:text-white disabled:opacity-50 sm:-left-6">
              <i className="iconify text-xl" data-icon="solar:alt-arrow-left-linear"></i>
            </button>
            <button className="custom-swiper-next absolute -right-5 top-[calc(50%-16px)] z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white text-primary shadow-[0_4px_12px_rgba(0,0,0,0.1)] ring-1 ring-slate-900/5 transition-all hover:scale-110 hover:bg-[#214545] hover:text-white disabled:opacity-50 sm:-right-6">
              <i className="iconify text-xl" data-icon="solar:alt-arrow-right-linear"></i>
            </button>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimoni" className="py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center">
            <h2 className="text-3xl font-semibold tracking-tight text-primary">Kisah Sukses Alumni</h2>
            <p className="mt-4 text-slate-600">Mereka telah membuktikannya, sekarang giliran Anda.</p>
          </div>

          <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {/* Testi 1 */}
            <div className="rounded-3xl border border-slate-200 bg-white p-8">
              <div className="mb-6 flex gap-1 text-secondary">
                {[...Array(5)].map((_, i) => (
                  <i key={i} className="iconify" data-icon="solar:star-bold"></i>
                ))}
              </div>
              <p className="text-sm italic leading-relaxed text-slate-600">
                "Metode pembelajarannya sangat terstruktur. Materi TIU yang awalnya sulit jadi terasa mudah dengan trik dari pengajar ANB."
              </p>
              <div className="mt-8 flex items-center gap-4">
                <img src="https://i.pravatar.cc/150?u=andi" alt="Andi Pratama" className="h-10 w-10 rounded-full object-cover" />
                <div>
                  <div className="text-sm font-semibold text-primary">Andi Pratama</div>
                  <div className="text-xs text-slate-500">Lulus Akpol 2023</div>
                </div>
              </div>
            </div>

            {/* Testi 2 */}
            <div className="rounded-3xl border border-slate-200 bg-white p-8">
              <div className="mb-6 flex gap-1 text-secondary">
                {[...Array(5)].map((_, i) => (
                  <i key={i} className="iconify" data-icon="solar:star-bold"></i>
                ))}
              </div>
              <p className="text-sm italic leading-relaxed text-slate-600">
                "Sangat terbantu dengan simulasi CAT yang mirip sekali dengan aslinya. Mental saya jadi jauh lebih siap saat tes CPNS."
              </p>
              <div className="mt-8 flex items-center gap-4">
                <img src="https://i.pravatar.cc/150?u=siti" alt="Siti Aminah" className="h-10 w-10 rounded-full object-cover" />
                <div>
                  <div className="text-sm font-semibold text-primary">Siti Aminah</div>
                  <div className="text-xs text-slate-500">Lulus CPNS Kemenkumham</div>
                </div>
              </div>
            </div>

            {/* Testi 3 */}
            <div className="rounded-3xl border border-slate-200 bg-white p-8">
              <div className="mb-6 flex gap-1 text-secondary">
                {[...Array(5)].map((_, i) => (
                  <i key={i} className="iconify" data-icon="solar:star-bold"></i>
                ))}
              </div>
              <p className="text-sm italic leading-relaxed text-slate-600">
                "Fasilitas konsultasi gratisnya sangat membantu saya memilih jurusan yang sesuai dengan kemampuan dan minat saya."
              </p>
              <div className="mt-8 flex items-center gap-4">
                <img src="https://i.pravatar.cc/150?u=budi" alt="Budi Santoso" className="h-10 w-10 rounded-full object-cover" />
                <div>
                  <div className="text-sm font-semibold text-primary">Budi Santoso</div>
                  <div className="text-xs text-slate-500">Lulus IPDN 2022</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-12">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-col items-center justify-between gap-8 md:flex-row">
            <div className="flex flex-col items-center md:items-start">
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold tracking-tighter text-primary">ANB</span>
                <div className="h-4 w-[1px] bg-slate-300"></div>
                <span className="text-xs font-medium uppercase tracking-widest text-slate-500">Ahmad Nadhif</span>
              </div>
              <p className="mt-4 text-center text-sm text-slate-500 md:text-left">
                Membimbing langkah Anda menuju masa depan cemerlang.
              </p>
            </div>
            
            <div className="flex gap-8">
              <a href="#" className="text-slate-400 transition-colors hover:text-secondary">
                <i className="iconify" data-icon="solar:camera-linear" data-width="24"></i>
              </a>
              <a href="#" className="text-slate-400 transition-colors hover:text-secondary">
                <i className="iconify" data-icon="solar:letter-linear" data-width="24"></i>
              </a>
              <a href="#" className="text-slate-400 transition-colors hover:text-secondary">
                <i className="iconify" data-icon="solar:videocamera-record-linear" data-width="24"></i>
              </a>
            </div>
          </div>
          
          <div className="mt-12 flex flex-col items-center justify-between border-t border-slate-100 pt-8 text-xs text-slate-400 md:flex-row">
            <p>© 2024 Ahmad Nadhif Bimbel. All rights reserved.</p>
            <div className="mt-4 flex gap-6 md:mt-0">
              <a href="#" className="hover:text-primary">Privacy Policy</a>
              <a href="#" className="hover:text-primary">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
