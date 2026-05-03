import { NextResponse } from "next/server"

import axios from "axios";

export async function GET(req: Request, ctx: { params: { slug: string } }) {
    const token: string = req.headers.get('authorization') as string;
    try {
        const res = await axios
            .get(`${process.env.BASE_URL}/articles/${ctx.params.slug}`, {
                headers: {
                    'Authorization': token
                }
            })



        return NextResponse.json({ data: await res.data, status: res.status })


    } catch (error: any) {
        console.error('API_SINGLE_ARTICLE_GET', error)
        if (
            error.response.status === 401 ||
            error.response.status === 422 ||
            error.response.status === 404
        ) {
            return NextResponse.json({ data: error.response.data.errors, status: error.response.status })
        }

        return new NextResponse('Internal server error', { status: 500, statusText: 'Internal server error' })
    }
}

export async function PUT(req: Request, ctx: { params: { slug: string } }) {
    const token: string = req.headers.get('authorization') as string;
    try {
        const body = await req.json();
        const res = await axios
            .put(`${process.env.BASE_URL}/articles/${ctx.params.slug}`, {
                article: {
                    body: body.body,
                    title: body.title,
                    description: body.description,
                }
            }, {
                headers: {
                    'Authorization': token
                }
            })
        return NextResponse.json({ data: await res.data, status: res.status })

    } catch (error: any) {
        console.error('API_ARTICLE_PUT', error)
        if (
            error.response.status === 401 ||
            error.response.status === 422
        ) {
            return NextResponse.json({ data: error.response.data.errors, status: error.response.status })
        }

        return new NextResponse('Internal server error', { status: 500, statusText: 'Internal server error' })
    }
}