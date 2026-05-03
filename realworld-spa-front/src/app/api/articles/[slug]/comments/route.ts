import axios from "axios";
import { NextResponse } from "next/server"

export async function POST(req: Request, ctx: { params: { slug: string } }) {
    const token: string = req.headers.get('authorization') as string;
    try {
        const body = await req.json();

        if (!body.body)
            return new NextResponse("Property body is required", {
                status: 400
            });

        const res = await axios
            .post(`${process.env.BASE_URL}/articles/${ctx.params.slug}/comments`, {
                comment: {
                    body: body.body
                }
            }, {
                headers: {
                    'Authorization': token
                }
            })

        return NextResponse.json({ data: await res.data, status: res.status })

    } catch (error: any) {
        console.error('API_CREATE_COMMENTS_POST', error)
        if (
            error.response.status === 401 ||
            error.response.status === 422
        ) {
            return NextResponse.json({ data: error.response.data.errors, status: error.response.status })
        }

        return new NextResponse('Internal server error', { status: 500, statusText: 'Internal server error' })
    }
}



export async function GET(req: Request, ctx: { params: { slug: string } }) {
    const token: string = req.headers.get('authorization') as string;
    try {

        const res = await axios
            .get(`${process.env.BASE_URL}/articles/${ctx.params.slug}/comments`, {
                headers: {
                    'Authorization': token
                }
            })

        return NextResponse.json({ data: await res.data, status: res.status })

    } catch (error: any) {
        console.error('API_CREATE_COMMENT_GET', error)
        if (
            error.response.status === 401 ||
            error.response.status === 422
        ) {
            return NextResponse.json({ data: error.response.data.errors, status: error.response.status })
        }

        return new NextResponse('Internal server error', { status: 500, statusText: 'Internal server error' })
    }
}