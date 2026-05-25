import Link from "next/link"

export default function Cta1() {
    return (
        <section className="section bg-brand-1 pt-60 pb-60">
            <div className="container">
                <div className="row align-items-center">
                    <div className="col-lg-8 mb-20">
                        <h2 className="color-brand-2 wow animate__animated animate__fadeIn">¿Listo para transformar tu negocio?</h2>
                        <p className="font-lg color-brand-2 wow animate__animated animate__fadeIn mt-10">
                            Únete a los cientos de comercios que ya confían en SmartLogix para gestionar su negocio.
                        </p>
                    </div>
                    <div className="col-lg-4 text-lg-end mb-20">
                        <Link className="btn btn-brand-2-full hover-up" href="#demo">
                            Solicitar Demo Gratis
                            <svg className="w-6 h-6 icon-16 ml-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                            </svg>
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    )
}
