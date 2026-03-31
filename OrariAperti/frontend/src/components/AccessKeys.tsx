import * as React from 'react';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card.tsx';
import { Input } from '@/components/ui/input.tsx';
import { Label } from '@/components/ui/label.tsx';
import { Button } from '@/components/ui/button.tsx';
import type { Reservation } from '@/types/types';
import { toast } from 'sonner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert.tsx';
import { Globe, LucideLink, LucideTriangleAlert, Shield } from 'lucide-react';

export default function AccessKeys({
    privateKey: initialPrivateKey,
    publicKey: initialPublicKey,
    onReservationLoaded,
    onLoad,
}: {
    privateKey?: string;
    publicKey?: string;
    onReservationLoaded?: (reservation: Reservation) => void;
    onLoad?: () => void;
}) {
    const [privateKey, setPrivateKey] = React.useState(initialPrivateKey || '');
    const [publicKey, setPublicKey] = React.useState(initialPublicKey || '');
    const [loading, setLoading] = React.useState(false);

    React.useEffect(() => {
        if ((initialPrivateKey || initialPublicKey) && !loading) {
            handleSubmit();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [initialPrivateKey, initialPublicKey]);

    async function handleSubmit(e?: React.FormEvent) {
        if (e) e.preventDefault();
        setLoading(true);
        try {
            const headers: Record<string, string> = { 'Content-Type': 'application/json' };
            if (privateKey) headers['privateKey'] = privateKey;
            else if (publicKey) headers['publicKey'] = publicKey;
            else throw new Error('Please enter a private or public key.');
            const res = await fetch(import.meta.env.VITE_APP_BACKEND_URL + '/api/reservation', {
                method: 'GET',
                headers,
            });
            if (!res.ok) throw new Error('Reservation not found or invalid key.');
            const data = await res.json();
            if (data.reservationDetails) {
                onReservationLoaded?.({
                    ...data.reservationDetails,
                    privateKey: data.privateKey,
                    publicKey: data.publicKey,
                });
                onLoad?.();
            } else {
                throw new Error('No reservation details found.');
            }
        } catch (err: unknown) {
            let message = 'Failed to load reservation.';
            if (err instanceof Error) message = err.message;
            toast.error(message, { dismissible: true, duration: 4000 });
        } finally {
            setLoading(false);
        }
    }

    return (
        <>
            <Card className="h-full w-full">
                <CardHeader>
                    <CardTitle>Access Keys</CardTitle>
                    <CardDescription>
                        Enter your Access Keys to view or edit your reservations.
                    </CardDescription>
                </CardHeader>
                <form className="flex flex-col h-full" onSubmit={handleSubmit}>
                    <CardContent className="flex-grow">
                        <div className="grid gap-6">
                            <div className="grid gap-2">
                                <Label htmlFor="privateKey">
                                    <Shield size={16} /> Private Key
                                </Label>
                                <Input
                                    type="text"
                                    id="privateKey"
                                    name="privateKey"
                                    placeholder="Enter your private key"
                                    value={privateKey}
                                    onChange={(e) => setPrivateKey(e.target.value)}
                                />
                                <Alert variant={'destructive'}>
                                    <LucideTriangleAlert />
                                    <AlertTitle className={'text-xs'}>
                                        Never share your private key with anyone.
                                    </AlertTitle>
                                    <AlertDescription className={'text-xs'}>
                                        It is used to securely access and manage your reservations.
                                    </AlertDescription>
                                </Alert>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="publicKey">
                                    <Globe size={16} /> Public Key
                                </Label>
                                <Input
                                    type="text"
                                    id="publicKey"
                                    name="publicKey"
                                    placeholder="Enter your public key"
                                    value={publicKey}
                                    onChange={(e) => setPublicKey(e.target.value)}
                                />
                                <Alert>
                                    <LucideLink />
                                    <AlertTitle className={'text-xs'}>
                                        Share your public key
                                    </AlertTitle>
                                    <AlertDescription className={'text-xs'}>
                                        Share your public key with others to allow them to view your
                                        reservations without giving them access to manage them.
                                    </AlertDescription>
                                </Alert>
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="mt-4">
                        <Button
                            type="submit"
                            variant="default"
                            className="w-full"
                            disabled={loading}
                        >
                            {loading ? 'Loading...' : 'Load Reservations'}
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </>
    );
}
