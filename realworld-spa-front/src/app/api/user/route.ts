import { NextResponse } from "next/server"

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import axios from "axios";
import { getSession } from "@/actions";

export async function GET(req: Request) {
    const cookieStore = cookies()
    const token: string = req.headers.get('authorization') as string;
    try {
        const res = await axios
            .get(`${process.env.BASE_URL}/user`, {
                headers: {
                    'Authorization': token
                }
            })

        return NextResponse.json({ data: await res.data, status: res.status })
    } catch (error: any) {
        console.error('API_USER_GET', error.response.status)
        if (error.response.status === 422
        ) {
            return NextResponse.json({ data: error.response.data.errors, status: error.response.status })
        }

        if (error.response.status == 401) {
            cookieStore.delete(process.env.COOKIE_NAME as string);
            redirect('/login')
        }
        return new NextResponse('Error', { status: 500, statusText: 'Internal server error' })
    }
}


export async function PUT(req: Request) {
    const token: string = req.headers.get('authorization') as string;
    try {
        const body = await req.json();

        const res = await axios
            .put(`${process.env.BASE_URL}/user`, {
                user: {
                    email: body.email,
                    password: body.password,
                    username: body.username,
                    bio: body.bio,
                    image: body.imageUrl,
                }
            }, {

                headers: {
                    'Authorization': token
                }
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
        console.error('API_USER_PUT', error.response.data)
        if (
            error.response.status === 401 ||
            error.response.status === 403 ||
            error.response.status === 422
        )
            return NextResponse.json({ data: error.response.data.errors, status: error.response.status })

        return new NextResponse('Error', { status: 500, statusText: 'Internal server error' })
    }
}