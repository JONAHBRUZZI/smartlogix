import { useState } from "react"

const faqs = [
    {
        question: "¿Qué necesito para usar SmartLogix?",
        answer: "Solo un navegador web moderno y conexión a internet. SmartLogix funciona 100% en la nube, no necesitas instalar nada."
    },
    {
        question: "¿Puedo probar SmartLogix antes de pagar?",
        answer: "Sí, ofrecemos 14 días de prueba gratuita en cualquier plan. Sin compromiso y sin necesidad de tarjeta de crédito."
    },
    {
        question: "¿SmartLogix funciona para cualquier tipo de negocio?",
        answer: "SmartLogix está diseñado para pequeños y medianos comercios: almacenes, minimarkets, botillerías, ferias, tiendas de barrio, y cualquier negocio que necesite POS, inventario y despachos."
    },
    {
        question: "¿El stock se actualiza automáticamente?",
        answer: "Sí. Cuando vendes desde el POS o confirmas un pedido, el stock se descuenta automáticamente. También recibirás alertas cuando un producto tenga stock crítico."
    },
    {
        question: "¿Cómo funciona el sistema de despachos?",
        answer: "Cuando confirmas un pedido, se crea un despacho automáticamente. El repartidor usa un código QR para marcar el retiro, y la entrega se confirma con el código del cliente y su RUT."
    },
    {
        question: "¿Puedo cancelar un pedido?",
        answer: "Sí, puedes cancelar pedidos en cualquier etapa. Si el stock ya fue descontado, se restaura automáticamente al cancelar."
    },
    {
        question: "¿SmartLogix tiene app móvil?",
        answer: "Por ahora SmartLogix es una aplicación web progresiva (PWA) que funciona en cualquier dispositivo. Los repartidores pueden acceder desde su celular para gestionar entregas."
    },
    {
        question: "¿Puedo exportar mis datos?",
        answer: "Sí, puedes exportar reportes de ventas, pedidos e inventario en formato CSV para usarlos en Excel u otras herramientas."
    }
]

export default function Faqs1() {
    const [openIndex, setOpenIndex] = useState(null)

    const toggleFaq = (index) => {
        setOpenIndex(openIndex === index ? null : index)
    }

    return (
        <section className="section pt-110 pb-110" id="faq">
            <div className="container">
                <div className="text-center">
                    <img className="mb-15" src="/assets/imgs/template/icons/favicon.svg" alt="smartlogix" />
                    <h2 className="color-brand-2 mb-20 wow animate__animated animate__fadeIn">Preguntas Frecuentes</h2>
                    <p className="font-md color-grey-700 wow animate__animated animate__fadeIn">
                        Todo lo que necesitas saber sobre SmartLogix.
                    </p>
                </div>
                <div className="row mt-50">
                    <div className="col-lg-10 m-auto">
                        {faqs.map((faq, index) => (
                            <div key={index} className="card card-faq wow animate__animated animate__fadeIn mb-15">
                                <div className="card-header-faq" onClick={() => toggleFaq(index)}>
                                    <h6 className="color-brand-2">{faq.question}</h6>
                                    <span className={openIndex === index ? "arrow-down rotate" : "arrow-down"}>
                                        <svg className="w-6 h-6 icon-16" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </span>
                                </div>
                                <div className={openIndex === index ? "card-body-faq open" : "card-body-faq"}>
                                    <p className="font-md color-grey-700">{faq.answer}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            <style jsx global>{`
                .card-faq {
                    border: 1px solid #CDE2E7;
                    border-radius: 8px;
                    overflow: hidden;
                    background: #fff;
                    transition: all 0.3s ease;
                }
                .card-faq:hover {
                    box-shadow: 0 4px 16px rgba(3, 68, 96, 0.08);
                }
                .card-header-faq {
                    padding: 20px 25px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    cursor: pointer;
                    background: #fff;
                    border-bottom: 1px solid transparent;
                    transition: all 0.3s ease;
                }
                .card-header-faq h6 {
                    margin: 0;
                    font-size: 16px;
                    font-weight: 600;
                    padding-right: 20px;
                }
                .card-body-faq {
                    max-height: 0;
                    overflow: hidden;
                    transition: max-height 0.35s ease, padding 0.35s ease;
                    padding: 0 25px;
                }
                .card-body-faq.open {
                    max-height: 500px;
                    padding: 0 25px 20px 25px;
                }
                .arrow-down {
                    transition: transform 0.3s ease;
                    flex-shrink: 0;
                }
                .arrow-down.rotate {
                    transform: rotate(180deg);
                }
            `}</style>
        </section>
    )
}
