import Link from "next/link"

export default function Hero1() {
    return (
        <section className="section d-block">
            <div className="box-swiper">
                <div className="swiper-container swiper-group-1 swiper-banner-1">
                    <div className="banner-1" style={{ background: 'linear-gradient(135deg, #034460 0%, #1C6180 50%, #2C7DA1 100%)' }}>
                        <div className="container">
                            <div className="row align-items-center">
                                <div className="col-lg-12">
                                    <p className="font-md color-white mb-15 wow animate__animated animate__fadeIn" data-wow-delay=".0s">
                                        🚀 Todo en uno para tu negocio
                                    </p>
                                    <h1 className="color-white mb-25 wow animate__animated animate__fadeInUp" data-wow-delay=".0s">
                                        POS, Inventario y Despachos<br className="d-none d-lg-block" />en un solo lugar
                                    </h1>
                                    <div className="row">
                                        <div className="col-lg-6">
                                            <p className="font-md color-white mb-20 wow animate__animated animate__fadeInUp" data-wow-delay=".0s">
                                                SmartLogix simplifica la gestión de tu pequeño comercio.
                                                Vende, controla stock, gestiona pedidos y coordina despachos desde un solo panel.
                                            </p>
                                        </div>
                                    </div>
                                    <div className="box-button mt-30">
                                        <Link className="btn btn-brand-1-big hover-up mr-40 wow animate__animated animate__fadeInUp" href="#demo">
                                            Solicitar Demo Gratis
                                        </Link>
                                        <Link className="btn btn-link-white hover-up wow animate__animated animate__fadeInUp" href="#caracteristicas">
                                            Conocer Más
                                            <svg className="w-6 h-6 icon-16 ml-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                            </svg>
                                        </Link>
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
