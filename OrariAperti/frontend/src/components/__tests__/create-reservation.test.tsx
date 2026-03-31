import React from 'react';
import { cleanup, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axios from 'axios';
import { describe, vi } from 'vitest';
import NewReservationDialog from '@/components/dialogs/NewReservationDialog.tsx';
import Main from '@/components/Main.tsx';

vi.mock('axios', () => ({
    default: {
        get: vi.fn(),
        post: vi.fn(),
    },
}));

vi.mock('@/components/ui/popover.tsx', () => ({
    Popover: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    PopoverTrigger: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    PopoverContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock('@/components/ui/calendar.tsx', () => ({
    Calendar: ({ onSelect }: { onSelect?: (date: Date) => void }) => (
        <button type="button" onClick={() => onSelect?.(new Date('2099-12-31T10:00:00Z'))}>
            Pick Tomorrow
        </button>
    ),
}));

vi.mock('@/components/ui/select.tsx', async () => {
    const ReactModule = await import('react');
    const SelectContext = ReactModule.createContext<{ onValueChange?: (value: string) => void }>(
        {}
    );

    return {
        Select: ({
            onValueChange,
            children,
        }: {
            onValueChange?: (value: string) => void;
            children: React.ReactNode;
        }) => <SelectContext.Provider value={{ onValueChange }}>{children}</SelectContext.Provider>,
        SelectTrigger: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
        SelectValue: ({ placeholder }: { placeholder?: string }) => <span>{placeholder}</span>,
        SelectContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
        SelectItem: ({ value, children }: { value: string; children: React.ReactNode }) => {
            const ctx = ReactModule.useContext(SelectContext);
            return (
                <button type="button" onClick={() => ctx.onValueChange?.(value)}>
                    {children}
                </button>
            );
        },
    };
});

describe('TC-FE01 — Frontend: Create reservation via dialog', () => {
    it('TC-FE01 creates a reservation and shows private/public keys after reload', async () => {
        const user = userEvent.setup();
        const mockedAxios = vi.mocked(axios, true);

        mockedAxios.get.mockResolvedValue({
            data: [
                {
                    id: 'room-1',
                    roomNumber: '101',
                    roomFeatures: ['WiFi'],
                },
            ],
        });

        mockedAxios.post.mockResolvedValue({
            status: 200,
            data: {
                privateKey: 'private-key-123',
                publicKey: 'public-key-123',
            },
        });

        const fetchMock = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => ({
                privateKey: 'private-key-123',
                publicKey: 'public-key-123',
                reservationDetails: {
                    id: 'reservation-1',
                    date: '2099-12-31',
                    startTime: '10:00',
                    endTime: '11:00',
                    roomId: 'room-1',
                    description: 'Project sync',
                    participants: 'Alice, Bob',
                    room: {
                        id: 'room-1',
                        roomNumber: '101',
                        roomFeatures: ['WiFi'],
                    },
                },
            }),
        });
        vi.stubGlobal('fetch', fetchMock);

        render(<NewReservationDialog />);

        await user.click(screen.getByRole('button', { name: /create reservation/i }));
        const dialog = await screen.findByRole('dialog');

        await user.click(within(dialog).getByRole('button', { name: /pick tomorrow/i }));
        await user.click(within(dialog).getByRole('button', { name: /room 101/i }));
        await user.click(within(dialog).getAllByRole('button', { name: '10:00' })[0]);
        await user.click(within(dialog).getAllByRole('button', { name: '11:00' })[1]);

        await user.type(
            within(dialog).getByPlaceholderText(/enter a description for your reservation/i),
            'Project sync'
        );
        await user.type(within(dialog).getByPlaceholderText(/john, jane, alex/i), 'Alice, Bob');

        await user.click(within(dialog).getByRole('button', { name: /^create$/i }));

        await waitFor(() => {
            expect(mockedAxios.post).toHaveBeenCalledTimes(1);
            expect(window.location.search).toContain('privateKey=private-key-123');
        });

        cleanup();
        render(<Main />);

        expect(await screen.findByDisplayValue('private-key-123')).toBeInTheDocument();
        expect(screen.getByDisplayValue('public-key-123')).toBeInTheDocument();
    });
});
