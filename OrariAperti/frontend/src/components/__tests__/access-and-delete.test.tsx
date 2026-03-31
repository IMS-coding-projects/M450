import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import '@testing-library/jest-dom';
import axios from 'axios';
import Main from '@/components/Main.tsx';

vi.mock('axios', () => ({
    default: {
        get: vi.fn(),
    },
}));

const futureReservation = {
    id: 'reservation-1',
    date: '2099-12-31',
    startTime: '10:00',
    endTime: '11:00',
    roomId: 'room-1',
    description: 'Team sync',
    participants: 'Alice, Bob',
    room: {
        id: 'room-1',
        roomNumber: '101',
        roomFeatures: ['WiFi', 'Whiteboard'],
    },
};

function mockReservationFetch() {
    const fetchMock = vi
        .fn()
        .mockImplementation(async (_input: RequestInfo | URL, init?: RequestInit) => {
            const method = init?.method ?? 'GET';
            const headers = (init?.headers ?? {}) as Record<string, string>;

            if (method === 'GET') {
                if (headers.privateKey === 'private-key-123') {
                    return {
                        ok: true,
                        json: async () => ({
                            privateKey: 'private-key-123',
                            publicKey: 'public-key-123',
                            reservationDetails: futureReservation,
                        }),
                    };
                }

                if (headers.publicKey === 'public-key-123') {
                    return {
                        ok: true,
                        json: async () => ({
                            privateKey: 'private-key-123',
                            publicKey: 'public-key-123',
                            reservationDetails: futureReservation,
                        }),
                    };
                }

                return { ok: false, text: async () => 'Reservation not found' };
            }

            if (method === 'DELETE') {
                return {
                    ok: true,
                    text: async () => '',
                };
            }

            return { ok: false, text: async () => 'Unhandled request' };
        });

    vi.stubGlobal('fetch', fetchMock);
    return fetchMock;
}

describe('Frontend access keys and delete flows', () => {
    it('TC-FE02 looks up reservation by publicKey in read-only mode', async () => {
        const user = userEvent.setup();
        vi.mocked(axios, true).get.mockResolvedValue({ data: [] });
        mockReservationFetch();

        render(<Main />);

        await user.type(screen.getByPlaceholderText(/enter your public key/i), 'public-key-123');
        await user.click(screen.getByRole('button', { name: /load reservations/i }));

        expect(await screen.findByText(/reservation for room 101/i)).toBeInTheDocument();
        expect(screen.queryByRole('button', { name: /edit/i })).not.toBeInTheDocument();
        expect(screen.queryByRole('button', { name: /^delete$/i })).not.toBeInTheDocument();
    });

    it('TC-FE03 looks up reservation by privateKey with edit/delete enabled', async () => {
        const user = userEvent.setup();
        vi.mocked(axios, true).get.mockResolvedValue({ data: [] });
        mockReservationFetch();

        render(<Main />);

        await user.type(screen.getByLabelText(/private key/i), 'private-key-123');
        await user.click(screen.getByRole('button', { name: /load reservations/i }));

        expect(await screen.findByText(/reservation for room 101/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /^delete$/i })).toBeInTheDocument();
    });

    it('TC-FE04 deletes reservation loaded via privateKey and resets URL state', async () => {
        const user = userEvent.setup();
        vi.mocked(axios, true).get.mockResolvedValue({ data: [] });
        const fetchMock = mockReservationFetch();

        window.history.pushState({}, '', '/?privateKey=private-key-123');

        render(<Main />);

        expect(await screen.findByText(/reservation for room 101/i)).toBeInTheDocument();

        await user.click(screen.getByRole('button', { name: /^delete$/i }));

        const alertDialog = await screen.findByRole('alertdialog');
        await user.click(within(alertDialog).getByRole('button', { name: /^delete$/i }));

        await waitFor(() => {
            expect(fetchMock).toHaveBeenCalledWith(
                expect.stringMatching(/\/api\/reservation\/reservation-1$/),
                expect.objectContaining({
                    method: 'DELETE',
                    headers: expect.objectContaining({ privateKey: 'private-key-123' }),
                })
            );
            expect(window.location.search).toBe('');
        });
    });
});
