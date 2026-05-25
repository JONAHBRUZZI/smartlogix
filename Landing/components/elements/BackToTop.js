import { useEffect, useState } from "react"

export default function BackToTop() {
    const [scroll, setScroll] = useState(0)
    useEffect(() => {
        document.addEventListener("scroll", () => {
            const scrollCheck = window.scrollY > 100
            if (scrollCheck !== scroll) {
                setScroll(scrollCheck)
            }
        })
    })
    return (
        <a className={scroll ? "btn-scroll-top active" : "btn-scroll-top"} href="#top">
            <svg className="icon-turn-arrow" width={12} height={8} viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M11.0001 7.00006L6.00006 2.00006L1.00006 7.00006" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        </a>
    )
}
