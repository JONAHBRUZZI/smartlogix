import Link from "next/link"

export default function Header1({ scroll, handleMobileMenuOpen }) {
    return (
        <>
            <header className={scroll ? "sl-header sl-header-scrolled" : "sl-header"}>
                <div className="container">
                    <div className="sl-header-inner">
                        <Link className="sl-logo" href="/">
                            <svg width="160" height="40" viewBox="0 0 160 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <rect x="2" y="6" width="28" height="28" rx="8" fill="#FEC201"/>
                                <text x="9" y="25" fontFamily="Arial" fontWeight="900" fontSize="16" fill="#034460">S</text>
                                <text x="36" y="25" fontFamily="Arial" fontWeight="800" fontSize="17" fill="#034460">SmartLogix</text>
                            </svg>
                        </Link>
                        <nav className="sl-nav">
                            <Link href="/">Inicio</Link>
                            <a href="#caracteristicas">Características</a>
                            <a href="#como-funciona">Cómo Funciona</a>
                            <a href="#planes">Planes</a>
                            <a href="#demo">Solicitar Demo</a>
                            <a href="#faq">FAQ</a>
                        </nav>
                        <div className="sl-actions">
                            <Link className="sl-btn-outline" href="https://app.smartlogix.cl">Iniciar Sesión</Link>
                            <Link className="sl-btn-primary" href="#demo">Solicitar Demo</Link>
                            <button className="sl-burger" onClick={handleMobileMenuOpen}>
                                <span /><span /><span />
                            </button>
                        </div>
                    </div>
                </div>
            </header>
            <style jsx global>{`
                .sl-header {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    z-index: 1000;
                    padding: 0;
                    background: #fff;
                    transition: box-shadow 0.3s ease;
                    float: none;
                    width: auto;
                    border-bottom: 1px solid transparent;
                }
                .sl-header-scrolled {
                    box-shadow: 0 2px 20px rgba(3, 68, 96, 0.1);
                }
                .sl-header-inner {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    height: 72px;
                    gap: 20px;
                }
                .sl-logo {
                    display: flex;
                    align-items: center;
                    flex-shrink: 0;
                    text-decoration: none;
                }
                .sl-nav {
                    display: none;
                    align-items: center;
                    gap: 8px;
                }
                .sl-nav a {
                    color: #034460;
                    font-size: 14px;
                    font-weight: 600;
                    text-decoration: none;
                    padding: 8px 14px;
                    border-radius: 8px;
                    transition: all 0.2s ease;
                    white-space: nowrap;
                }
                .sl-nav a:hover {
                    color: #FEC201;
                    background: rgba(254,194,1,0.08);
                }
                .sl-actions {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    flex-shrink: 0;
                }
                .sl-btn-outline {
                    display: none;
                    color: #034460;
                    font-size: 14px;
                    font-weight: 600;
                    text-decoration: none;
                    padding: 10px 20px;
                    border: 2px solid #CDE2E7;
                    border-radius: 8px;
                    transition: all 0.2s ease;
                    white-space: nowrap;
                }
                .sl-btn-outline:hover {
                    border-color: #034460;
                    color: #034460;
                }
                .sl-btn-primary {
                    color: #034460;
                    background: #FEC201;
                    font-size: 14px;
                    font-weight: 700;
                    text-decoration: none;
                    padding: 10px 20px;
                    border-radius: 8px;
                    transition: all 0.2s ease;
                    white-space: nowrap;
                }
                .sl-btn-primary:hover {
                    background: #ffd700;
                    transform: translateY(-1px);
                    color: #034460;
                }
                .sl-burger {
                    display: flex;
                    flex-direction: column;
                    gap: 5px;
                    padding: 8px;
                    background: none;
                    border: none;
                    cursor: pointer;
                    margin-left: 4px;
                }
                .sl-burger span {
                    display: block;
                    width: 24px;
                    height: 2px;
                    background: #034460;
                    border-radius: 2px;
                    transition: all 0.3s ease;
                }
                @media (min-width: 1200px) {
                    .sl-nav { display: flex; }
                    .sl-btn-outline { display: inline-flex; }
                    .sl-btn-primary { display: inline-flex; }
                    .sl-burger { display: none; }
                }
            `}</style>
        </>
    )
}
