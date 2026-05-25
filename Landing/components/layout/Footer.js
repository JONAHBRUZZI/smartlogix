import Link from "next/link"

export default function Footer1() {
    return (
        <footer className="footer">
            <div className="footer-1">
                <div className="container">
                    <div className="row">
                        <div className="col-lg-3 width-23 mb-30">
                            <div className="mb-20">
                                <svg width="160" height="40" viewBox="0 0 160 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <rect x="0" y="4" width="32" height="32" rx="8" fill="#FEC201"/>
                                    <text x="6" y="26" fontFamily="Arial" fontWeight="bold" fontSize="16" fill="#034460">S</text>
                                    <text x="38" y="27" fontFamily="Arial" fontWeight="800" fontSize="20" fill="white">SmartLogix</text>
                                </svg>
                            </div>
                            <p className="font-xs mb-20 color-white">SmartLogix es la plataforma todo-en-uno para pequeños comercios. POS, inventario, pedidos, despachos y dashboard en un solo lugar.</p>
                            <h6 className="color-brand-1">Síguenos</h6>
                            <div className="mt-15">
                                <Link className="icon-socials icon-facebook" href="#" />
                                <Link className="icon-socials icon-instagram" href="#" />
                                <Link className="icon-socials icon-twitter" href="#" />
                                <Link className="icon-socials icon-youtube" href="#" />
                            </div>
                        </div>
                        <div className="col-lg-3 width-16 mb-30">
                            <h5 className="mb-10 color-brand-1">Producto</h5>
                            <ul className="menu-footer">
                                <li><a href="#caracteristicas">Características</a></li>
                                <li><a href="#como-funciona">Cómo Funciona</a></li>
                                <li><a href="#planes">Planes y Precios</a></li>
                                <li><a href="#demo">Solicitar Demo</a></li>
                                <li><a href="#faq">Preguntas Frecuentes</a></li>
                            </ul>
                        </div>
                        <div className="col-lg-3 width-16 mb-30">
                            <h5 className="mb-10 color-brand-1">Empresa</h5>
                            <ul className="menu-footer">
                                <li><Link href="#">Sobre Nosotros</Link></li>
                                <li><Link href="#">Blog</Link></li>
                                <li><Link href="#">Carreras</Link></li>
                                <li><Link href="#">Prensa</Link></li>
                            </ul>
                        </div>
                        <div className="col-lg-3 width-20 mb-30">
                            <h5 className="mb-10 color-brand-1">Contacto</h5>
                            <ul className="menu-footer">
                                <li><Link href="mailto:contacto@smartlogix.cl">contacto@smartlogix.cl</Link></li>
                                <li><Link href="tel:+56912345678">+56 9 1234 5678</Link></li>
                                <li><span className="color-grey-300">Santiago, Chile</span></li>
                            </ul>
                            <h6 className="color-brand-1 mt-20 mb-10">Horario</h6>
                            <p className="font-xs color-white">Lun - Vie: 9:00 - 18:00</p>
                        </div>
                    </div>
                </div>
            </div>
            <div className="footer-2">
                <div className="container">
                    <div className="footer-bottom">
                        <div className="row align-items-center">
                            <div className="col-lg-6 col-md-12 text-center text-lg-start">
                                <span className="color-grey-300 font-md">&copy; SmartLogix {new Date().getFullYear()}. Todos los derechos reservados.</span>
                            </div>
                            <div className="col-lg-6 col-md-12 text-center text-lg-end">
                                <ul className="menu-bottom">
                                    <li><Link className="font-sm color-grey-300" href="#">Política de Privacidad</Link></li>
                                    <li><Link className="font-sm color-grey-300" href="#">Términos del Servicio</Link></li>
                                    <li><Link className="font-sm color-grey-300" href="#">Cookies</Link></li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    )
}
