"use client";

import Image from "next/image";
import Link from "next/link";
import { twMerge } from "tailwind-merge";

type LogoProps = {
    size?: "big" | "small";
    className?: string;
    clickable?: boolean;
};

export function Logo({ size = "small", className = "", clickable = true }: LogoProps) {
    const src = size === "big" ? "/logoBig.png" : "/logoSmall.png";

    const img = (
        <Image
            src={src}
            alt="Getabec Logo"
            width={size === "big" ? 160 : 36}
            height={size === "big" ? 160 : 36}
            className={twMerge("select-none", className)}
            priority
        />
    );

    return clickable ? <Link href="/">{img}</Link> : img;
}
