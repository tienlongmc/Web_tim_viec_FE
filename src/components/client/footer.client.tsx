import { useEffect } from "react";

const Footer = () => {
    useEffect(() => {
        const script = document.createElement("script");
        script.src = "https://cdn.fchat.vn/assets/embed/webchat.js?id=67f39cd2cada1e5af00ee042";
        script.async = true;
        document.body.appendChild(script);

        return () => {
            // cleanup nếu cần thiết
            document.body.removeChild(script);
        };
    }, []);
    return (

        <footer style={{ padding: 15, textAlign: "center" }}>

        </footer>
        
    )
}

export default Footer;