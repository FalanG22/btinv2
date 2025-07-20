
'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { getZonesForPrint } from '@/lib/actions';
import type { Zone } from '@/lib/data';
import QRCode from 'qrcode';

function PrintableZone({ zone, qrCodeUrl }: { zone: Zone, qrCodeUrl: string }) {
  return (
    <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-400 p-4 break-inside-avoid">
        <h2 className="text-3xl font-bold mb-2">{zone.name}</h2>
        {qrCodeUrl ? (
            <img src={qrCodeUrl} alt={`QR Code for ${zone.name}`} className="w-48 h-48" />
        ) : (
            <div className="w-48 h-48 bg-gray-200 flex items-center justify-center">
                <p className="text-sm text-gray-500">Generando QR...</p>
            </div>
        )}
        <p className="text-center text-sm mt-2 text-gray-600">{zone.description}</p>
    </div>
  );
}

function PrintPageContent() {
    const searchParams = useSearchParams();
    const [zonesToPrint, setZonesToPrint] = useState<Zone[]>([]);
    const [qrCodes, setQrCodes] = useState<Record<string, string>>({});

    useEffect(() => {
        const fromZoneId = searchParams.get('from');
        const toZoneId = searchParams.get('to');

        if (fromZoneId && toZoneId) {
            getZonesForPrint(fromZoneId, toZoneId).then(zones => {
                setZonesToPrint(zones);
            });
        }
    }, [searchParams]);

    useEffect(() => {
        if (zonesToPrint.length > 0) {
            const generateQRCodes = async () => {
                const codes: Record<string, string> = {};
                for (const zone of zonesToPrint) {
                    try {
                        // The data in the QR code is just the zone name for easy scanning
                        const url = await QRCode.toDataURL(zone.name, {
                           errorCorrectionLevel: 'H',
                           margin: 2,
                           width: 256
                        });
                        codes[zone.id] = url;
                    } catch (err) {
                        console.error(err);
                    }
                }
                setQrCodes(codes);
            };
            generateQRCodes();
        }
    }, [zonesToPrint]);
    
     useEffect(() => {
        // Automatically trigger print dialog once QR codes are generated
        if (zonesToPrint.length > 0 && Object.keys(qrCodes).length === zonesToPrint.length) {
            window.print();
        }
    }, [qrCodes, zonesToPrint.length]);

    if (zonesToPrint.length === 0) {
        return <div className="p-10 text-center">Cargando zonas para imprimir...</div>;
    }

    return (
        <main className="p-4 bg-white text-black">
            <div className="printable-area grid grid-cols-2 gap-4">
                {zonesToPrint.map(zone => (
                    <PrintableZone key={zone.id} zone={zone} qrCodeUrl={qrCodes[zone.id]} />
                ))}
            </div>
        </main>
    );
}

export default function PrintPage() {
    return (
        <Suspense fallback={<div className="p-10 text-center">Cargando...</div>}>
            <PrintPageContent />
        </Suspense>
    );
}
