function Footer() {
    return (
        <div className="absolute bottom-0 w-full flex justify-between items-center">
            <ul className="flex gap-8 m-0 p-4 list-none">
                <li>
                    <a
                        href="#"
                        className="text-black no-underline font-semibold p-2 shadow-[white_-1px_-1px_0,white_1px_-1px_0,white_-1px_1px_0,white_1px_1px_0]"
                    >
                        FAQ
                    </a>
                </li>
                <li>
                    <a
                        href="#"
                        className="text-black no-underline font-semibold p-2 shadow-[white_-1px_-1px_0,white_1px_-1px_0,white_-1px_1px_0,white_1px_1px_0]"
                    >
                        SOCIAL
                    </a>
                </li>
                <li>
                    <a
                        href="#"
                        className="text-black no-underline font-semibold p-2 shadow-[white_-1px_-1px_0,white_1px_-1px_0,white_-1px_1px_0,white_1px_1px_0]"
                    >
                        TIMELINE
                    </a>
                </li>
            </ul>
            <a
                href="#"
                className="text-black no-underline font-semibold p-2 shadow-[white_-1px_-1px_0,white_1px_-1px_0,white_-1px_1px_0,white_1px_1px_0]"
            >
                ©2025 AROUNDTHEWAY®
            </a>
        </div>
    );
}

export default Footer;