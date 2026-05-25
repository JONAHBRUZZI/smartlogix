export default function Testimonial1() {
    const testimonials = [
        {
            quote: "Desde que usamos SmartLogix, tenemos control total del inventario. Antes perdíamos ventas por no saber qué había en bodega. Ahora todo está sincronizado.",
            name: "María Rojas",
            role: "Dueña, Almacén La Esquina",
            rating: 5
        },
        {
            quote: "El POS es súper rápido. Mis cajeros aprendieron en minutos. Lo mejor es que el stock se descuenta solo y puedo ver las ventas del día desde el celular.",
            name: "Pedro Soto",
            role: "Gerente, Minimarket Don Juan",
            rating: 5
        },
        {
            quote: "El sistema de despachos con QR nos cambió la vida. Antes los repartidores se perdían, ahora cada entrega queda registrada con foto y RUT del receptor.",
            name: "Luis Castro",
            role: "Coordinador de Logística",
            rating: 5
        }
    ]

    return (
        <section className="section pt-110 pb-110 bg-customers-say">
            <div className="container">
                <div className="text-center mb-40">
                    <img className="mb-15" src="/assets/imgs/template/icons/favicon.svg" alt="smartlogix" />
                    <h2 className="color-white mb-20 wow animate__animated animate__fadeIn">Lo que dicen nuestros clientes</h2>
                    <p className="font-lg color-white wow animate__animated animate__fadeIn">
                        Comercios que ya modernizaron su gestión con SmartLogix.
                    </p>
                </div>
                <div className="row">
                    {testimonials.map((t, i) => (
                        <div key={i} className="col-lg-4 col-md-6 mb-30 wow animate__animated animate__fadeIn" data-wow-delay={`.${i}s`}>
                            <div className="card-testimonial hover-up">
                                <div className="box-author-testimonial">
                                    <div className="author-info">
                                        <span className="font-lg color-white">{t.name}</span>
                                        <span className="font-xs color-white">{t.role}</span>
                                    </div>
                                </div>
                                <div className="rate">
                                    {[...Array(t.rating)].map((_, j) => (
                                        <svg key={j} className="icon-16" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                        </svg>
                                    ))}
                                </div>
                                <p className="font-md color-white mb-20">{t.quote}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
