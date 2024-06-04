import getSession from '@/lib/session';
import { NextRequest, NextResponse } from 'next/server';
import serverAxios, { apiHandler } from '@/lib/server-axios';

export const POST = apiHandler(async (req: NextRequest) => {
    const { serviceName, proof, issuerPubKey } = await req.json();
    const res = await serverAxios.post(`/service/verify-proof`, {
        ServiceName: serviceName,
        IssuerPubKey: issuerPubKey,
        proof,
    });

    return NextResponse.json({
        result: res.data.statusCode,
        data: res.data.data,
    });
});
