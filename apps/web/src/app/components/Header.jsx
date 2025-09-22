"use client";
import { useState } from 'react';

function Header() {
    const [logoSrc, setLogoSrc] = useState('/aroundthewayLogoA.png');

    return (
        <div className="bg-white sticky flex items-center h-16 px-6 border-b border-gray-200 relative z-[1000]">
            <img
                className="h-8 w-auto block object-contain"
                src={logoSrc}
                alt="Aroundtheway Logo"
                onMouseEnter={() => setLogoSrc('/aroundthewayLogo.png')}
                onMouseLeave={() => setLogoSrc('/aroundthewayLogoA.png')}
            />

            <nav className="flex-1 ml-16 self-center">
                <ul className="flex flex-row justify-start items-center gap-12 list-none m-0">
                    <li className="relative group">
                        <a
                            href="#"
                            className="text-black text-sm font-light hover:opacity-60 transition-opacity"
                        >
                            SHOP
                        </a>
                        <ul className="absolute top-full left-0 hidden group-hover:block bg-white border border-gray-100 py-2 min-w-32 shadow-sm">
                            <li>
                                <a
                                    href="/clothing"
                                    className="block px-4 py-2 text-sm text-black hover:bg-gray-50"
                                >
                                    CLOTHING
                                </a>
                            </li>
                            <li>
                                <a
                                    href="#"
                                    className="block px-4 py-2 text-sm text-black hover:bg-gray-50"
                                >
                                    ACCESSORIES
                                </a>
                            </li>
                        </ul>
                    </li>

                    <li>
                        <a
                            href="#"
                            className="text-black text-sm font-light hover:opacity-60 transition-opacity"
                        >
                            COMMUNITY
                        </a>
                    </li>

                    <li>
                        <a
                            href="#"
                            className="text-black text-sm font-light hover:opacity-60 transition-opacity"
                        >
                            CONTACT
                        </a>
                    </li>

                    <li>
                        <a
                            href="/chat"
                            className="text-black text-sm font-light hover:opacity-60 transition-opacity"
                        >
                            CHAT
                        </a>
                    </li>
                </ul>
            </nav>

            <section>
                <ul className="flex flex-row justify-end items-center gap-8 list-none m-0 p-0">
                    <li>
                        <a
                            href="#"
                            className="no-underline text-black tracking-tight text-xs"
                        >
                            ACCOUNT
                        </a>
                    </li>
                    <li>
                        <a
                            href="#"
                            className="no-underline text-black tracking-tight text-xs"
                        >
                            BAG
                        </a>
                    </li>
                </ul>
            </section>
        </div>
    );
}

export default Header;