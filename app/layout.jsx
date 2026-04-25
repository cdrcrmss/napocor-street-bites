import "./globals.css";

export const metadata = {
    title: "Napocor Sari-Sari Store System",
    description: "Admin inventory and POS system for sari-sari stores"
};

export default function RootLayout({ children }) {
    return ( <
        html lang = "en" >
        <
        body > { children } < /body> <
        /html>
    );
}