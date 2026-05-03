import { NextResponse } from "next/server"

import axios from "axios";

export async function GET(_req: Request) {
    try {

        const res = await axios.get(`${process.env.BASE_URL}/tags`)



        return NextResponse.json({ data: await res.data, status: res.status })
    } catch (error: any) {
        console.error('API_TAGS_GET', error)
        if (error.response.status === 422) {
            return NextResponse.json({ data: error.response.data.errors, status: error.response.status })
        }


        return new NextResponse('Internal server error', { status: 500, statusText: 'Internal server error' })
    }
}