import Link from "next/link"

export default function Info1() {
    return (
        <section className="section mt-100">
            <div className="container">
                <div className="row align-items-center">
                    <div className="col-lg-6 mb-30">
                        <div className="box-image-how">
                            <div className="box-image-touch" />
                            <svg width="100%" height="420" viewBox="0 0 540 420" fill="none" xmlns="http://www.w3.org/2000/svg" style={{maxWidth:540}}>
                                <rect x="20" y="20" width="500" height="380" rx="20" fill="white" stroke="#CDE2E7" strokeWidth="1" />
                                <rect x="40" y="40" width="460" height="55" rx="10" fill="#034460" />
                                <text x="60" y="72" fontFamily="Arial" fontWeight="bold" fontSize="18" fill="white">SmartLogix Dashboard</text>
                                <rect x="50" y="110" width="140" height="85" rx="12" fill="#FFE799" />
                                <text x="65" y="142" fontFamily="Arial" fontSize="13" fill="#034460">Ventas Hoy</text>
                                <text x="65" y="175" fontFamily="Arial" fontWeight="bold" fontSize="24" fill="#034460">$245.600</text>
                                <rect x="205" y="110" width="140" height="85" rx="12" fill="#DFF9F3" />
                                <text x="220" y="142" fontFamily="Arial" fontSize="13" fill="#034460">Pedidos Activos</text>
                                <text x="220" y="175" fontFamily="Arial" fontWeight="bold" fontSize="24" fill="#034460">12</text>
                                <rect x="360" y="110" width="140" height="85" rx="12" fill="#EBF5F8" />
                                <text x="375" y="142" fontFamily="Arial" fontSize="13" fill="#034460">Stock Crítico</text>
                                <text x="375" y="175" fontFamily="Arial" fontWeight="bold" fontSize="24" fill="#FF3E3E">3</text>
                                <rect x="50" y="210" width="220" height="170" rx="12" fill="#F9FAF5" stroke="#CDE2E7" />
                                <text x="70" y="240" fontFamily="Arial" fontWeight="bold" fontSize="14" fill="#034460">Ventas por Hora</text>
                                <rect x="70" y="255" width="180" height="12" rx="6" fill="#E0F0F6" />
                                <rect x="70" y="255" width="120" height="12" rx="6" fill="#FEC201" />
                                <rect x="70" y="280" width="180" height="12" rx="6" fill="#E0F0F6" />
                                <rect x="70" y="280" width="150" height="12" rx="6" fill="#16BA8F" />
                                <rect x="70" y="305" width="180" height="12" rx="6" fill="#E0F0F6" />
                                <rect x="70" y="305" width="90" height="12" rx="6" fill="#28A7E6" />
                                <rect x="70" y="330" width="180" height="12" rx="6" fill="#E0F0F6" />
                                <rect x="70" y="330" width="60" height="12" rx="6" fill="#F69D30" />
                                <rect x="290" y="210" width="220" height="170" rx="12" fill="#F9FAF5" stroke="#CDE2E7" />
                                <text x="310" y="240" fontFamily="Arial" fontWeight="bold" fontSize="14" fill="#034460">Top Productos</text>
                                <text x="310" y="265" fontFamily="Arial" fontSize="12" fill="#5B647C">1. Coca-Cola 2L</text>
                                <text x="460" y="265" fontFamily="Arial" fontSize="12" fill="#034460">$85.200</text>
                                <text x="310" y="290" fontFamily="Arial" fontSize="12" fill="#5B647C">2. Papas Lays</text>
                                <text x="460" y="290" fontFamily="Arial" fontSize="12" fill="#034460">$42.100</text>
                                <text x="310" y="315" fontFamily="Arial" fontSize="12" fill="#5B647C">3. Jugo Watt's</text>
                                <text x="460" y="315" fontFamily="Arial" fontSize="12" fill="#034460">$38.500</text>
                                <text x="310" y="340" fontFamily="Arial" fontSize="12" fill="#5B647C">4. Menta Alka</text>
                                <text x="460" y="340" fontFamily="Arial" fontSize="12" fill="#034460">$24.300</text>
                            </svg>
                        </div>
                    </div>
                    <div className="col-lg-6 mb-30">
                        <h2 className="color-brand-2 mb-20 wow animate__animated animate__fadeIn">Control total de tu negocio</h2>
                        <p className="font-md color-grey-700 mb-30 wow animate__animated animate__fadeIn">
                            SmartLogix te da visibilidad completa sobre tus ventas, inventario y pedidos en tiempo real.
                            Toma decisiones informadas con datos actualizados al instante.
                        </p>
                        <ul className="list-ticks list-ticks-2 mb-30">
                            <li className="wow animate__animated animate__fadeIn" data-wow-delay=".0s">
                                <svg className="icon-16" fill="currentColor" viewBox="0 0 20 20">
                                    <path clipRule="evenodd" fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" />
                                </svg>
                                Dashboard en tiempo real con métricas clave
                            </li>
                            <li className="wow animate__animated animate__fadeIn" data-wow-delay=".1s">
                                <svg className="icon-16" fill="currentColor" viewBox="0 0 20 20">
                                    <path clipRule="evenodd" fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" />
                                </svg>
                                Alertas automáticas de stock crítico
                            </li>
                            <li className="wow animate__animated animate__fadeIn" data-wow-delay=".2s">
                                <svg className="icon-16" fill="currentColor" viewBox="0 0 20 20">
                                    <path clipRule="evenodd" fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" />
                                </svg>
                                Reportes exportables en CSV
                            </li>
                            <li className="wow animate__animated animate__fadeIn" data-wow-delay=".3s">
                                <svg className="icon-16" fill="currentColor" viewBox="0 0 20 20">
                                    <path clipRule="evenodd" fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" />
                                </svg>
                                Historial completo de clientes y pedidos
                            </li>
                            <li className="wow animate__animated animate__fadeIn" data-wow-delay=".4s">
                                <svg className="icon-16" fill="currentColor" viewBox="0 0 20 20">
                                    <path clipRule="evenodd" fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" />
                                </svg>
                                Multiusuario con roles y permisos
                            </li>
                        </ul>
                        <Link className="btn btn-brand-1 hover-up wow animate__animated animate__fadeIn" href="#demo" data-wow-delay=".5s">
                            Probar Gratis 14 Días
                            <svg className="w-6 h-6 icon-16 ml-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                            </svg>
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    )
}
