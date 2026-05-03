import localFont from 'next/font/local'
import { Titillium_Web } from "next/font/google";

export const sourceSansPro = localFont({ src: './fonts/source-sans-pro.regular.ttf' })
export const sourceSansProLight = localFont({ src: './fonts/source-sans-pro.light.ttf' })
export const sourceSansProExtraLight = localFont({ src: './fonts/source-sans-pro.extralight.ttf' })


export const titilliumWeb = Titillium_Web({
    weight: "700",
    subsets: ["latin"],
});



