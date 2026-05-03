import { NextResponse } from "next/server";

import axios from "axios";

import { getSession } from "@/actions";

export async function POST(req: Request) {
    try {

        const body = await req.json();

        if (!body.username)
            return new NextResponse("Property username is required", {
                status: 400
            });
        if (!body.email)
            return new NextResponse("Property email is required", {
                status: 400
            });
        if (!body.password)
            return new NextResponse("Property password is required", {
                status: 400,
            });

        const res = await axios
            .post(`${process.env.BASE_URL}/users`, {
                user: {
                    email: body.email,
                    username: body.username,
                    password: body.password,
                },
            })

        const data = await res.data
        const session = await getSession();

        session.isLoggedIn = true;
        session.email = data.user.email;
        session.username = data.user.username;
        session.token = data.user.token;
        await session.save();

        return NextResponse.json({ data: await res.data, status: res.status })

    } catch (error: any) {
        console.error('API_REGISTER_POST', error)
        if (
            error.response.status === 403 ||
            error.response.status === 422
        )
            return NextResponse.json({ data: error.response.data.errors, status: error.response.status })

        return new NextResponse('Error', { status: 500, statusText: 'Internal server error' })
    }

}
