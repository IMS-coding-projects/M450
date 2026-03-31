export interface ReservationDTO {
    date: string;
    startTime: string;
    endTime: string;
    roomId: string;
    description: string;
    participants: string;
}

export interface Reservation extends ReservationDTO {
    id: string;
    privateKey: string;
    publicKey: string;
    room?: Room;
}

export type Room = {
    id: string;
    roomNumber: string;
    roomFeatures: string[];
};

export type RoomFeature =
    | 'Beamer'
    | 'Water Tap'
    | 'Whiteboard'
    | 'Air Conditioning'
    | 'Projector Screen'
    | 'Speaker System'
    | 'Video Conferencing'
    | 'WiFi'
    | 'Power Outlets'
    | 'Natural Light'
    | 'Soundproofing'
    | 'Smart Board'
    | 'Telephone'
    | 'Coffee Machine'
    | 'Printer'
    | 'Lockers';
