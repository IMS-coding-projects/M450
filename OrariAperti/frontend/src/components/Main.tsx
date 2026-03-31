import { useState } from 'react';
import AccessKeys from '@/components/AccessKeys.tsx';
import CurrentReservation from '@/components/CurrentReservation.tsx';
import type { Reservation } from '@/types/types';
import { Separator } from '@/components/ui/separator.tsx';
import FAQAccordion from '@/components/FAQAccordion.tsx';

function getQueryParam(param: string) {
    const params = new URLSearchParams(window.location.search);
    for (const [key, value] of params.entries()) {
        if (key.toLowerCase() === param.toLowerCase()) {
            return value;
        }
    }
    return undefined;
}

export default function MainUIOnly() {
    const [reservation, setReservation] = useState<Reservation | undefined>(undefined);

    const publicKey = getQueryParam('publicKey');
    const privateKey = getQueryParam('privateKey');

    return (
        <main className="container mx-auto p-6 w-full">
            <div className="flex flex-col md:flex-row gap-6">
                <div className="w-full md:w-1/3 flex-shrink-0 h-full md:h-auto">
                    <AccessKeys
                        onReservationLoaded={setReservation}
                        publicKey={publicKey || undefined}
                        privateKey={privateKey || undefined}
                    />
                </div>
                <div className="w-full md:w-2/3 flex-grow h-full md:h-auto">
                    <CurrentReservation reservation={reservation} />
                </div>
            </div>
            <Separator className="my-4" />
            <FAQAccordion />
        </main>
    );
}
