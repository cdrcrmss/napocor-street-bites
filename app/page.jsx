import Script from "next/script";

export default function Page() {
    return ( <
        main >
        <
        link rel = "stylesheet"
        href = "/spa.css" / >
        <
        div id = "spa-root" > < /div> <
        Script src = "/spa.js"
        strategy = "afterInteractive" / >
        <
        /main>
    );
}