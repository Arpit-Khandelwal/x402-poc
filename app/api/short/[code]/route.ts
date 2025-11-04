import { NextResponse } from 'next/server';
import { getOriginalUrl } from '../../../../lib/linkStore';

export async function GET(request: Request, { params })
{
    const { code } = await params || { code: '' };
    if (!code) {
        return NextResponse.json({ error: 'Missing code' }, { status: 400 });
    }

    const original = getOriginalUrl(code);
    if (!original) {
        return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json({ original }, { status: 200 });
}
