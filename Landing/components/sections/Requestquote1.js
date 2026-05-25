import { useState } from "react"

export default function Requestquote1() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        business: '',
        message: ''
    })
    const [submitted, setSubmitted] = useState(false)

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        // Demo: enviar a email service (mailto como placeholder)
        const mailto = `mailto:contacto@smartlogix.cl?subject=Solicitud de Demo - ${formData.business}&body=Nombre: ${formData.name}%0AEmail: ${formData.email}%0ATeléfono: ${formData.phone}%0ANegocio: ${formData.business}%0AMensaje: ${formData.message}`
        window.location.href = mailto
        setSubmitted(true)
    }

    return (
        <section className="section pt-110 pb-110 bg-brand-2" id="demo">
            <div className="container">
                <div className="row align-items-center">
                    <div className="col-lg-6 mb-30">
                        <span className="font-lg color-brand-1 mb-10 d-block">¿Listo para modernizar tu negocio?</span>
                        <h2 className="color-white mb-20 wow animate__animated animate__fadeIn">Solicita una Demo Gratis</h2>
                        <p className="font-md color-white wow animate__animated animate__fadeIn">
                            Cuéntanos sobre tu negocio y te mostraremos cómo SmartLogix puede ayudarte.
                            Sin compromiso, sin tarjeta de crédito.
                        </p>
                        <div className="mt-40">
                            <div className="d-flex align-items-center mb-25">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <rect width="24" height="24" rx="12" fill="#FEC201"/>
                                    <path d="M7 12l3 3 7-7" stroke="#034460" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                                <span className="font-md color-white ml-15">Demo personalizada para tu negocio</span>
                            </div>
                            <div className="d-flex align-items-center mb-25">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <rect width="24" height="24" rx="12" fill="#FEC201"/>
                                    <path d="M7 12l3 3 7-7" stroke="#034460" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                                <span className="font-md color-white ml-15">Prueba gratuita de 14 días</span>
                            </div>
                            <div className="d-flex align-items-center mb-25">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <rect width="24" height="24" rx="12" fill="#FEC201"/>
                                    <path d="M7 12l3 3 7-7" stroke="#034460" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                                <span className="font-md color-white ml-15">Sin compromiso, cancela cuando quieras</span>
                            </div>
                        </div>
                    </div>
                    <div className="col-lg-6 mb-30">
                        <div className="bg-white p-40 bd-rd16">
                            {submitted ? (
                                <div className="text-center">
                                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{margin:'0 auto'}}>
                                        <rect width="24" height="24" rx="12" fill="#16BA8F"/>
                                        <path d="M7 12l3 3 7-7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                    <h4 className="color-brand-2 mt-20">¡Gracias por tu interés!</h4>
                                    <p className="font-md color-grey-700 mt-15">Te contactaremos pronto para coordinar tu demo personalizada.</p>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit}>
                                    <h4 className="color-brand-2 mb-20">Solicitar Demo</h4>
                                    <div className="row">
                                        <div className="col-lg-6">
                                            <div className="form-group mb-20">
                                                <input className="form-control" name="name" placeholder="Nombre completo *" required value={formData.name} onChange={handleChange} />
                                            </div>
                                        </div>
                                        <div className="col-lg-6">
                                            <div className="form-group mb-20">
                                                <input className="form-control" name="email" type="email" placeholder="Email *" required value={formData.email} onChange={handleChange} />
                                            </div>
                                        </div>
                                        <div className="col-lg-6">
                                            <div className="form-group mb-20">
                                                <input className="form-control" name="phone" placeholder="Teléfono" value={formData.phone} onChange={handleChange} />
                                            </div>
                                        </div>
                                        <div className="col-lg-6">
                                            <div className="form-group mb-20">
                                                <input className="form-control" name="business" placeholder="Nombre del negocio *" required value={formData.business} onChange={handleChange} />
                                            </div>
                                        </div>
                                        <div className="col-12">
                                            <div className="form-group mb-20">
                                                <textarea className="form-control" name="message" rows={4} placeholder="Cuéntanos sobre tu negocio..." value={formData.message} onChange={handleChange} />
                                            </div>
                                        </div>
                                        <div className="col-12">
                                            <button type="submit" className="btn btn-brand-1-big hover-up w-100">Enviar Solicitud</button>
                                        </div>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
