export default function Preloader() {
    return (
        <div id="preloader-active">
            <div className="preloader d-flex align-items-center justify-content-center">
                <div className="preloader-inner position-relative">
                    <div className="text-center">
                        <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" style={{margin:'0 auto'}}>
                            <rect x="5" y="5" width="70" height="70" rx="16" fill="#FEC201"/>
                            <text x="28" y="55" fontFamily="Arial" fontWeight="bold" fontSize="36" fill="#034460">S</text>
                        </svg>
                        <div className="loader" />
                    </div>
                </div>
            </div>
            <style jsx>{`
                .loader {
                    width: 48px;
                    height: 48px;
                    border: 5px solid #FEC201;
                    border-bottom-color: #034460;
                    border-radius: 50%;
                    display: inline-block;
                    box-sizing: border-box;
                    animation: rotation 1s linear infinite;
                    margin-top: 20px;
                }
                @keyframes rotation {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                #preloader-active {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: white;
                    z-index: 99999;
                }
                .preloader {
                    height: 100vh;
                    width: 100%;
                }
            `}</style>
        </div>
    )
}
