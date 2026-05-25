import Link from "next/link"

export default function Cta1() {
    return (
        <section className="section pt-70 pb-70 bg-get-quote">
            <div className="container">
                <div className="box-get-quote">
                    <div className="get-quote-left">
                        <h2 className="color-brand-1 wow animate__animated animate__fadeIn">
                            ¿Listo para transformar tu negocio?
                        </h2>
                        <p className="font-3xl color-white mb-10 wow animate__animated animate__fadeIn">
                            Únete a los cientos de comercios que ya confían en SmartLogix.
                        </p>
                    </div>
                    <div className="get-quote-right">
                        <Link className="btn btn-get-quote wow animate__animated animate__fadeIn" href="#demo">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="currentColor"/>
                            </svg>
                            Solicitar Demo Gratis
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    )
}
