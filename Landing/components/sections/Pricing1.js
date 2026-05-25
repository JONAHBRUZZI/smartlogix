import Link from "next/link"

export default function Pricing1() {
    return (
        <section className="section bg-grey-100 bg-choose-plan pt-110 pb-110" id="planes">
            <div className="container">
                <div className="text-center">
                    <img className="mb-15" src="/assets/imgs/template/icons/favicon.svg" alt="smartlogix" />
                    <h2 className="color-brand-2 mb-20 wow animate__animated animate__fadeIn">Elige el Plan Ideal</h2>
                    <p className="font-lg color-grey-500 wow animate__animated animate__fadeIn">
                        Todos los planes incluyen prueba gratuita de 14 días.<br className="d-none d-lg-block" />Sin compromiso, cancela cuando quieras.
                    </p>
                </div>
                <div className="row mt-50 align-items-center">
                    <div className="col-xl-4 col-lg-4 wow animate__animated animate__fadeIn" data-wow-delay=".0s">
                        <div className="card-plan hover-up">
                            <h3 className="color-brand-2 title-plan">Emprendedor</h3>
                            <p className="font-md color-grey-500 desc-plan">Perfecto para negocios que están comenzando.</p>
                            <div className="item-price-plan">
                                <div className="for-month display-month">
                                    <h3 className="color-brand-2 d-inline-block">$<span>19</span></h3><span className="color-grey-500 font-sm">/mes</span>
                                </div>
                                <div className="for-year">
                                    <h3 className="color-brand-2 d-inline-block">$<span>199</span></h3><span className="color-grey-500 font-sm">/año</span>
                                </div>
                            </div>
                            <div className="line-border" />
                            <div className="mt-30 mb-30">
                                <ul className="list-ticks list-ticks-2">
                                    <li><svg className="icon-16" fill="currentColor" viewBox="0 0 20 20"><path clipRule="evenodd" fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" /></svg>POS básico</li>
                                    <li><svg className="icon-16" fill="currentColor" viewBox="0 0 20 20"><path clipRule="evenodd" fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" /></svg>Hasta 50 productos</li>
                                    <li><svg className="icon-16" fill="currentColor" viewBox="0 0 20 20"><path clipRule="evenodd" fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" /></svg>Gestión de pedidos</li>
                                    <li><svg className="icon-16" fill="currentColor" viewBox="0 0 20 20"><path clipRule="evenodd" fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" /></svg>Dashboard básico</li>
                                    <li><svg className="icon-16" fill="currentColor" viewBox="0 0 20 20"><path clipRule="evenodd" fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" /></svg>1 sucursal</li>
                                    <li><svg className="icon-16" fill="currentColor" viewBox="0 0 20 20"><path clipRule="evenodd" fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" /></svg>Soporte por email</li>
                                </ul>
                            </div>
                            <div className="mt-20">
                                <Link className="btn btn-brand-2-full hover-up" href="#demo">
                                    Comenzar Prueba
                                    <svg className="w-6 h-6 icon-16 ml-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                                </Link>
                            </div>
                        </div>
                    </div>
                    <div className="col-xl-4 col-lg-4 wow animate__animated animate__fadeIn" data-wow-delay=".1s">
                        <div className="card-plan popular hover-up">
                            <h3 className="color-brand-2 title-plan">Negocio</h3>
                            <p className="font-md color-grey-500 desc-plan">La opción más completa para tu negocio en crecimiento.</p>
                            <div className="item-price-plan">
                                <div className="for-month display-month">
                                    <h3 className="color-brand-2 d-inline-block">$<span>39</span></h3><span className="color-grey-500 font-sm">/mes</span>
                                </div>
                                <div className="for-year">
                                    <h3 className="color-brand-2 d-inline-block">$<span>399</span></h3><span className="color-grey-500 font-sm">/año</span>
                                </div>
                            </div>
                            <div className="line-border" />
                            <div className="mt-30 mb-30">
                                <ul className="list-ticks list-ticks-2">
                                    <li><svg className="icon-16" fill="currentColor" viewBox="0 0 20 20"><path clipRule="evenodd" fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" /></svg>POS completo + carrito</li>
                                    <li><svg className="icon-16" fill="currentColor" viewBox="0 0 20 20"><path clipRule="evenodd" fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" /></svg>Productos ilimitados</li>
                                    <li><svg className="icon-16" fill="currentColor" viewBox="0 0 20 20"><path clipRule="evenodd" fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" /></svg>Despachos con QR + repartidor</li>
                                    <li><svg className="icon-16" fill="currentColor" viewBox="0 0 20 20"><path clipRule="evenodd" fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" /></svg>Dashboard avanzado + reportes</li>
                                    <li><svg className="icon-16" fill="currentColor" viewBox="0 0 20 20"><path clipRule="evenodd" fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" /></svg>Alertas de stock crítico</li>
                                    <li><svg className="icon-16" fill="currentColor" viewBox="0 0 20 20"><path clipRule="evenodd" fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" /></svg>Soporte prioritario</li>
                                </ul>
                            </div>
                            <div className="mt-20">
                                <Link className="btn btn-brand-2-full hover-up" href="#demo">
                                    Comenzar Prueba
                                    <svg className="w-6 h-6 icon-16 ml-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                                </Link>
                            </div>
                        </div>
                    </div>
                    <div className="col-xl-4 col-lg-4 wow animate__animated animate__fadeIn" data-wow-delay=".2s">
                        <div className="card-plan hover-up">
                            <h3 className="color-brand-2 title-plan">Empresa</h3>
                            <p className="font-md color-grey-500 desc-plan">Para negocios con múltiples sucursales y equipo.</p>
                            <div className="item-price-plan">
                                <div className="for-month display-month">
                                    <h3 className="color-brand-2 d-inline-block">$<span>79</span></h3><span className="color-grey-500 font-sm">/mes</span>
                                </div>
                                <div className="for-year">
                                    <h3 className="color-brand-2 d-inline-block">$<span>799</span></h3><span className="color-grey-500 font-sm">/año</span>
                                </div>
                            </div>
                            <div className="line-border" />
                            <div className="mt-30 mb-30">
                                <ul className="list-ticks list-ticks-2">
                                    <li><svg className="icon-16" fill="currentColor" viewBox="0 0 20 20"><path clipRule="evenodd" fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" /></svg>Todo lo del plan Negocio</li>
                                    <li><svg className="icon-16" fill="currentColor" viewBox="0 0 20 20"><path clipRule="evenodd" fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" /></svg>Múltiples sucursales</li>
                                    <li><svg className="icon-16" fill="currentColor" viewBox="0 0 20 20"><path clipRule="evenodd" fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" /></svg>Roles y permisos personalizados</li>
                                    <li><svg className="icon-16" fill="currentColor" viewBox="0 0 20 20"><path clipRule="evenodd" fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" /></svg>API y exportación de datos</li>
                                    <li><svg className="icon-16" fill="currentColor" viewBox="0 0 20 20"><path clipRule="evenodd" fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" /></svg>Gerente de cuenta dedicado</li>
                                    <li><svg className="icon-16" fill="currentColor" viewBox="0 0 20 20"><path clipRule="evenodd" fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" /></svg>Soporte 24/7</li>
                                </ul>
                            </div>
                            <div className="mt-20">
                                <Link className="btn btn-brand-2-full hover-up" href="#demo">
                                    Contactar Ventas
                                    <svg className="w-6 h-6 icon-16 ml-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
