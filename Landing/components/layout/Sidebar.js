import Link from "next/link"

export default function Sidebar({ openClass, handleMobileMenuClose }) {
    return (
        <div className={openClass ? "mobile-header-active mobile-menu-active" : "mobile-header-active"}>
            <div className="clickalbe-sidebar-btn" onClick={handleMobileMenuClose}>
                <button className="off-canvas-close">
                    <svg className="icon-close" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M15.8332 4.16666L4.1665 15.8333M4.1665 4.16666L15.8332 15.8333" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </button>
            </div>
            <div className="sidebar-content">
                <div className="mobile-header-logo">
                    <Link href="/">
                        <svg width="140" height="35" viewBox="0 0 140 35" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect x="0" y="3" width="28" height="28" rx="7" fill="#FEC201"/>
                            <text x="5" y="23" fontFamily="Arial" fontWeight="bold" fontSize="14" fill="#034460">S</text>
                            <text x="33" y="24" fontFamily="Arial" fontWeight="800" fontSize="18" fill="#034460">SmartLogix</text>
                        </svg>
                    </Link>
                </div>
                <nav className="mobile-menu">
                    <ul>
                        <li><Link href="/" onClick={handleMobileMenuClose}>Inicio</Link></li>
                        <li><a href="#caracteristicas" onClick={handleMobileMenuClose}>Características</a></li>
                        <li><a href="#como-funciona" onClick={handleMobileMenuClose}>Cómo Funciona</a></li>
                        <li><a href="#planes" onClick={handleMobileMenuClose}>Planes</a></li>
                        <li><a href="#demo" onClick={handleMobileMenuClose}>Solicitar Demo</a></li>
                        <li><a href="#faq" onClick={handleMobileMenuClose}>FAQ</a></li>
                        <li><Link href="https://app.smartlogix.cl" onClick={handleMobileMenuClose}>Iniciar Sesión</Link></li>
                    </ul>
                </nav>
            </div>
        </div>
    )
}
