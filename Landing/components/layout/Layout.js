import { useEffect, useState } from "react"
import BackToTop from '../elements/BackToTop'
import Footer from './Footer'
import Header1 from './Header1'
import PageHead from './PageHead'
import Sidebar from './Sidebar'

export default function Layout({ headTitle, children }) {
    const [scroll, setScroll] = useState(0)
    const [openClass, setOpenClass] = useState('')

    const handleMobileMenuOpen = () => {
        document.body.classList.add("mobile-menu-active")
        setOpenClass("sidebar-visible")
    }

    const handleMobileMenuClose = () => {
        if (openClass === "sidebar-visible") {
            setOpenClass("")
            document.body.classList.remove("mobile-menu-active")
        }
    }

    useEffect(() => {
        document.addEventListener("scroll", () => {
            const scrollCheck = window.scrollY > 100
            if (scrollCheck !== scroll) {
                setScroll(scrollCheck)
            }
        })

        const WOW = require('wowjs')
        window.wow = new WOW.WOW({ live: false })
        window.wow.init()
    }, [])

    return (
        <>
            <PageHead headTitle={headTitle} />
            <div className="body-overlay-1" onClick={handleMobileMenuClose} />
            <Header1 scroll={scroll} handleMobileMenuOpen={handleMobileMenuOpen} />
            <Sidebar openClass={openClass} handleMobileMenuClose={handleMobileMenuClose} />
            <main className="main">
                {children}
            </main>
            <Footer />
            <BackToTop />
        </>
    )
}
