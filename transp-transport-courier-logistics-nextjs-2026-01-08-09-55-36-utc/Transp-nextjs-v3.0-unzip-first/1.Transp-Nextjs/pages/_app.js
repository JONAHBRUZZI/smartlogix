import Preloader from "@/components/elements/Preloader";
import { useEffect, useState } from "react";
import "@/public/assets/css/vendors/normalize.css";
import "@/public/assets/css/vendors/bootstrap.min.css";
import "@/public/assets/css/vendors/uicons-regular-rounded.css";
import "@/public/assets/css/plugins/swiper-bundle.min.css";
import "@/public/assets/css/plugins/magnific-popup.css";
import "@/public/assets/css/plugins/select2.min.css";
import "@/public/assets/css/plugins/slick.css";
import "@/public/assets/css/plugins/perfect-scrollbar.css";
import "@/public/assets/css/plugins/animate.min.css";
import "@/public/assets/css/style.css";

import "swiper/css";
// import "swiper/css/navigation";
import "swiper/css/pagination";

function MyApp({ Component, pageProps }) {
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        setTimeout(() => {
            setLoading(false);
        }, 1000);
    }, []);
    return <>{!loading ? <Component {...pageProps} /> : <Preloader />}</>;
}

export default MyApp;
