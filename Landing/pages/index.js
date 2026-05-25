import Layout from "@/components/layout/Layout"
import Hero1 from "@/components/sections/Hero1"
import Services1 from "@/components/sections/Services1"
import Howitwork1 from "@/components/sections/Howitwork1"
import Pricing1 from "@/components/sections/Pricing1"
import Requestquote1 from "@/components/sections/Requestquote1"
import Faqs1 from "@/components/sections/Faqs1"
import Cta1 from "@/components/sections/Cta1"

export default function Home() {
    return (
        <Layout>
            <Hero1 />
            <Services1 />
            <Howitwork1 />
            <Pricing1 />
            <Requestquote1 />
            <Faqs1 />
            <Cta1 />
        </Layout>
    )
}
