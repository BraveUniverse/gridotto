import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// IPFS API isteklerini yönlendirmek için middleware
export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  
  // IPFS API isteklerini kontrol et
  if (url.pathname.startsWith('/ipfs/')) {
    // Universal Profile Cloud API'sine yönlendir
    const ipfsPath = url.pathname.slice(6); // '/ipfs/' kısmını çıkar
    return NextResponse.redirect(`https://api.universalprofile.cloud/ipfs/${ipfsPath}`);
  }
  
  return NextResponse.next();
}

// Middleware'in çalışacağı yolları belirt
export const config = {
  matcher: ['/ipfs/:path*'],
}; 