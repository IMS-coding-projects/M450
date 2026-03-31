import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { SquareArrowOutUpRight } from 'lucide-react';

export default function FAQAccordion() {
    return (
        <>
            <Accordion type="single" collapsible className="w-2/3 mx-auto my-8">
                <AccordionItem value="item-1">
                    <AccordionTrigger className={'hover:cursor-pointer'}>
                        How do I reserve a room?
                    </AccordionTrigger>
                    <AccordionContent className="flex flex-col gap-4 text-balance">
                        <p>
                            Click the "Create Reservation" button on the main page and fill out the
                            form with the required details such as date, time, room, description,
                            and participants. The system will check if the room is available before
                            confirming your reservation. Then you will be able to share the
                            reservation with others using the easy-to-use share link. (works via the
                            public key)
                        </p>
                    </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-2">
                    <AccordionTrigger className={'hover:cursor-pointer'}>
                        What are the private and public keys for?
                    </AccordionTrigger>
                    <AccordionContent className="flex flex-col gap-4 text-balance">
                        <p>
                            After creating a reservation, you receive two keys: a <b>private key</b>{' '}
                            and a <b>public key</b>.
                            <br />
                            The private key allows you to edit or delete your reservation, while the
                            public key can be shared with others so they can view the reservation
                            details, but not modify them.
                        </p>
                    </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-3">
                    <AccordionTrigger className={'hover:cursor-pointer'}>
                        Do I need an account to use the system?
                    </AccordionTrigger>
                    <AccordionContent className="flex flex-col gap-4 text-balance">
                        <p>
                            No account is required. All reservation management is done using the
                            private and public keys provided after creating a reservation.{' '}
                            <b>
                                Keep your private key secure, as it grants full control over your
                                reservation.
                            </b>
                        </p>
                    </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-4">
                    <AccordionTrigger className={'hover:cursor-pointer'}>
                        What rules apply to reservations?
                    </AccordionTrigger>
                    <AccordionContent className="flex flex-col gap-4 text-balance">
                        <p>
                            Reservations can only be made for available rooms and valid time slots.
                            The system prevents overlapping bookings and ensures that the start time
                            is before the end time. Reservations cannot be made in the past. The
                            participant field only allows letters, spaces, and commas.
                        </p>
                    </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-5">
                    <AccordionTrigger className={'hover:cursor-pointer'}>
                        What if I lose my private or public key?
                    </AccordionTrigger>
                    <AccordionContent className="flex flex-col gap-4 text-balance">
                        <p>
                            If you lose your private key, you will not be able to edit or delete
                            your reservation. Similarly, if you lose your public key, you cannot
                            share the reservation for viewing unless you still have the private key.
                            Then you can restore the public key by entering the private and copying
                            the public one.
                            <br />
                            <br />
                            For security reasons, we cannot recover lost keys. You will need to
                            create a new reservation if necessary.
                        </p>
                    </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-6">
                    <AccordionTrigger className={'hover:cursor-pointer'}>
                        Who can I contact for support or issues?
                    </AccordionTrigger>
                    <AccordionContent className="flex flex-col gap-4 text-balance">
                        <p>
                            If you encounter technical issues or have questions not answered here,
                            please contact us on{' '}
                            <Badge>
                                <a
                                    href="https://github.com/orgs/IMS-coding-projects/teams/dev"
                                    className={'flex'}
                                >
                                    <SquareArrowOutUpRight size={15} className={'mr-1'} />
                                    GitHub
                                </a>
                            </Badge>
                            . We are glad to help you with any problems or concerns you may have
                            regarding the reservation system.
                        </p>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        </>
    );
}
