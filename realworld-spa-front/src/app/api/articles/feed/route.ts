import { NextRequest, NextResponse } from "next/server";

import axios from "axios";

export async function GET(req: NextRequest) {
    const token: string = req.headers.get('authorization') as string;
    try {
        const tag = req.nextUrl.searchParams.get('tag')
        const limit = req.nextUrl.searchParams.get('limit')
        const author = req.nextUrl.searchParams.get('author')
        const offset = req.nextUrl.searchParams.get('offset')
        const favorited = req.nextUrl.searchParams.get('favorited')

        let url: string = `${process.env.BASE_URL}/articles/feed/?`;

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
            .get(url, {
                headers: {
                    'Authorization': token
                }
            })
        return NextResponse.json({ data: await res.data, status: res.status })

    } catch (error: any) {
        console.error('API_ARTICLE_FEED_GET', error)
        if (error.response.status === 422) {
            return NextResponse.json({ data: error.response.data.errors, status: error.response.status })
        }
        if (error.response.status === 401) {
            return NextResponse.json({ data: { "User": ['missing authorization credentials'] }, status: error.response.status })
        }

        return new NextResponse('Internal server error', { status: 500, statusText: 'Internal server error' })
    }
}