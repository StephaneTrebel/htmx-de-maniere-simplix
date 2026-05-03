import { NextRequest, NextResponse } from "next/server"

import axios from "axios";

export async function POST(req: Request) {
    const token: string = req.headers.get('authorization') as string;
    try {
        const body = await req.json();

        if (!body.title)
            return new NextResponse("Property title is required", {
                status: 400
            });
        if (!body.description)
            return new NextResponse("Property description is required", {
                status: 400
            });
        if (!body.body)
            return new NextResponse("Property body is required", {
                status: 400
            });


        const res = await axios
            .post(`${process.env.BASE_URL}/articles`, {
                article: {
                    title: body.title,
                    description: body.description,
                    body: body.description,
                    tagList: body.tagList
                }
            }, {
                headers: {
                    'Authorization': token
                }
            })

        return NextResponse.json({ data: await res.data, status: res.status })

    } catch (error: any) {
        console.error('API_ARTICLE_POST', error)
        if (
            error.response.status === 401 ||
            error.response.status === 422
        ) {
            return NextResponse.json({ data: error.response.data.errors, status: error.response.status })
        }

        return new NextResponse('Internal server error', { status: 500, statusText: 'Internal server error' })
    }
}

export async function GET(req: NextRequest) {
    const token: string = req.headers.get('authorization') as string;

    try {
        const tag = req.nextUrl.searchParams.get('tag')
        const limit = req.nextUrl.searchParams.get('limit')
        const author = req.nextUrl.searchParams.get('author')
        const offset = req.nextUrl.searchParams.get('offset')
        const favorited = req.nextUrl.searchParams.get('favorited')

        let url: string = `${process.env.BASE_URL}/articles/?`;

        limit ?
            url += `limit=${+limit}` : url += `limit=${10}`;
        tag ?
            url += `&tag=${tag}` : null;
        author ?
            url += `&author=${author}` : null;
        offset ?
            url += `&offset=${+offset}` : url += `&offset=${0}`;
        favorited ?
            url += `&favorited=${favorited}` : null;

        const res = await axios
            .get(url
                , {
                    headers: {
                        'Authorization': token
                    }
                })

        return NextResponse.json({ data: await res.data, status: res.status })

    } catch (error: any) {
        console.error('API_ARTICLE_GET', error)
        if (error.response.status === 422) {
            return NextResponse.json({ data: error.response.data.errors, status: error.response.status })
        }

        if (error.response.status === 401) {
            return NextResponse.json({ data: error.response.data.errors ? error.response.data.errors : { '': [error.response.data.message] }, status: error.response.status })

        }

        return new NextResponse('Internal server error', { status: 500, statusText: 'Internal server error' })
    }
}
