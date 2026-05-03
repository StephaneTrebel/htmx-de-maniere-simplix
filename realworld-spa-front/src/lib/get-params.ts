export const getParams = (searchParams: { [key: string]: string | number | undefined }) => {
    const page = searchParams["page"] ? (searchParams["page"] as number) : 1;
    const offset =
        searchParams["offset"] && (searchParams["offset"] as number) >= 0
            ? (searchParams["offset"] as number)
            : 0;
    const tag = searchParams["tag"]
        ? (searchParams["tag"] as string)
        : undefined;
    const limit = searchParams["limit"]
        ? (searchParams["limit"] as number)
        : 10;
    const author = searchParams["author"]
        ? (searchParams["author"] as string)
        : undefined;
    const favorited = searchParams["favorited"]
        ? (searchParams["favorited"] as string)
        : undefined;
    const feed = searchParams["feed"]
        ? (searchParams["feed"] as number)
        : undefined;

    return { page, offset, tag, limit, author, favorited, feed };
}