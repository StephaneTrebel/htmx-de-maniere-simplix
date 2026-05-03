import { ReactElement } from "react";

export type TNavLink =
    {
        href: string;
        name: string;
        icon?: ReactElement;
        isLoggedIn: boolean;
    } 