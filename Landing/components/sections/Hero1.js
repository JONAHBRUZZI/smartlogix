import Link from "next/link"

export default function Hero1() {
    return (
        <section className="section d-block">
            <div className="box-swiper">
                <div className="swiper-container swiper-group-1 swiper-banner-1">
                    <div className="banner-1" style={{ background: 'linear-gradient(135deg, #034460 0%, #1C6180 50%, #2C7DA1 100%)' }}>
                        <div className="container">
                            <div className="row align-items-center">
                                <div className="col-lg-6">
                                    <div className="box-banner-left">
                                        <span className="font-lg color-white mb-15 wow animate__animated animate__fadeIn" data-wow-delay=".0s">
                                            🚀 Todo en uno para tu negocio
                                        </span>
                                        <h1 className="color-white mb-25 wow animate__animated animate__fadeInUp" data-wow-delay=".1s">
                                            POS, Inventario y Despachos<br className="d-none d-lg-block" />en un solo lugar
                                        </h1>
                                        <div className="row">
                                            <div className="col-lg-8">
                                                <p className="font-md color-white mb-30 wow animate__animated animate__fadeInUp" data-wow-delay=".2s">
                                                    SmartLogix simplifica la gestión de tu pequeño comercio.
                                                    Vende, controla stock, gestiona pedidos y coordina despachos desde un solo panel.
                                                </p>
                                            </div>
                                        </div>
                                        <div className="box-button mt-30">
                                            <Link className="btn btn-brand-1-big hover-up mr-20 wow animate__animated animate__fadeInUp" href="#demo" data-wow-delay=".3s">
                                                Solicitar Demo Gratis
                                            </Link>
                                            <Link className="btn btn-link-white hover-up wow animate__animated animate__fadeInUp" href="#caracteristicas" data-wow-delay=".4s">
                                                Conocer Más
                                                <svg className="w-6 h-6 icon-16 ml-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                                </svg>
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-lg-6">
                                    <div className="box-banner-right wow animate__animated animate__fadeInRight" data-wow-delay=".3s">
                                        <div className="box-img-banner">
                                            <svg width="500" height="400" viewBox="0 0 500 400" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <rect x="20" y="20" width="460" height="360" rx="16" fill="white" />
                                                <rect x="40" y="40" width="420" height="50" rx="8" fill="#034460" />
                                                <text x="60" y="70" fontFamily="Arial" fontWeight="bold" fontSize="16" fill="white">Dashboard SmartLogix</text>
                                                <rect x="40" y="105" width="130" height="80" rx="8" fill="#FEC201" />
                                                <text x="55" y="135" fontFamily="Arial" fontSize="12" fill="#034460">Ventas Hoy</text>
                                                <text x="55" y="165" fontFamily="Arial" fontWeight="bold" fontSize="20" fill="#034460">$245.600</text>
                                                <rect x="185" y="105" width="130" height="80" rx="8" fill="#16BA8F" />
                                                <text x="200" y="135" fontFamily="Arial" fontSize="12" fill="white">Pedidos</text>
                                                <text x="200" y="165" fontFamily="Arial" fontWeight="bold" fontSize="20" fill="white">12</text>
                                                <rect x="330" y="105" width="130" height="80" rx="8" fill="#034460" />
                                                <text x="345" y="135" fontFamily="Arial" fontSize="12" fill="#FEC201">Stock Crítico</text>
                                                <text x="345" y="165" fontFamily="Arial" fontWeight="bold" fontSize="20" fill="white">3</text>
                                                <rect x="40" y="200" width="420" height="160" rx="8" fill="#F9FAF5" stroke="#CDE2E7" strokeWidth="1" />
                                                <text x="60" y="230" fontFamily="Arial" fontWeight="bold" fontSize="14" fill="#034460">Últimos Pedidos</text>
                                                <rect x="60" y="245" width="380" height="30" rx="4" fill="white" />
                                                <text x="75" y="265" fontFamily="Arial" fontSize="12" fill="#5B647C">#001 - Coca-Cola 2L - $2.400 - En Preparación</text>
                                                <rect x="60" y="282" width="380" height="30" rx="4" fill="white" />
                                                <text x="75" y="302" fontFamily="Arial" fontSize="12" fill="#5B647C">#002 - Papas Lays - $1.500 - En Reparto</text>
                                                <rect x="60" y="319" width="380" height="30" rx="4" fill="white" />
                                                <text x="75" y="339" fontFamily="Arial" fontSize="12" fill="#5B647C">#003 - Jugo Watt's - $3.200 - Entregado</text>
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
