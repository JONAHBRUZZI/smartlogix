import Link from "next/link"

export default function Hero1() {
    return (
        <section className="section mt-0 pt-0">
            <div className="banner-1 banner-homepage1">
                <div className="container">
                    <div className="row align-items-center">
                        <div className="col-lg-6">
                            <div className="box-banner-left">
                                <span className="font-lg color-brand-1">🚀 Todo en uno para tu negocio</span>
                                <h1 className="color-brand-2 mt-20 mb-20">
                                    POS, Inventario y Despachos<br />en un solo lugar
                                </h1>
                                <p className="font-md color-grey-700 mb-45">
                                    SmartLogix es la plataforma que simplifica la gestión de tu pequeño comercio.
                                    Vende, controla tu stock, gestiona pedidos y coordina despachos desde un solo panel.
                                </p>
                                <div className="d-flex align-items-center">
                                    <Link className="btn btn-brand-1-big hover-up mr-20" href="#demo">
                                        Solicitar Demo Gratis
                                    </Link>
                                    <Link className="btn btn-link-medium hover-up" href="#caracteristicas">
                                        Conocer Más
                                        <svg className="w-6 h-6 icon-16 ml-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                        </svg>
                                    </Link>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-6">
                            <div className="box-banner-right">
                                <div className="box-img-banner">
                                    <svg width="500" height="400" viewBox="0 0 500 400" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <rect x="20" y="20" width="460" height="360" rx="16" fill="#E0F0F6" />
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
                                        <rect x="40" y="200" width="420" height="160" rx="8" fill="white" stroke="#CDE2E7" strokeWidth="1" />
                                        <text x="60" y="230" fontFamily="Arial" fontWeight="bold" fontSize="14" fill="#034460">Últimos Pedidos</text>
                                        <rect x="60" y="245" width="380" height="30" rx="4" fill="#F2F3F4" />
                                        <text x="75" y="265" fontFamily="Arial" fontSize="12" fill="#5B647C">#001 - Coca-Cola 2L - $2.400 - En Preparación</text>
                                        <rect x="60" y="282" width="380" height="30" rx="4" fill="#F2F3F4" />
                                        <text x="75" y="302" fontFamily="Arial" fontSize="12" fill="#5B647C">#002 - Papas Lays - $1.500 - En Reparto</text>
                                        <rect x="60" y="319" width="380" height="30" rx="4" fill="#F2F3F4" />
                                        <text x="75" y="339" fontFamily="Arial" fontSize="12" fill="#5B647C">#003 - Jugo Watt's - $3.200 - Entregado</text>
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
