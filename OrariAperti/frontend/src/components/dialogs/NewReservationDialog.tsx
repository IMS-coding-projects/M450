import * as React from 'react';
import { Label } from '@/components/ui/label.tsx';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover.tsx';
import { Button } from '@/components/ui/button.tsx';
import { CalendarIcon, LucideEdit } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar.tsx';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select.tsx';
import { Textarea } from '@/components/ui/textarea.tsx';
import { Input } from '@/components/ui/input.tsx';
import { type FieldErrors, useForm } from 'react-hook-form';
import type { ReservationDTO, Room } from '@/types/types.ts';
import axios from 'axios';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { FeatureBadge } from '../FeatureBadge.tsx';

export default function NewReservationDialog() {
    const {
        register,
        handleSubmit,
        reset,
        watch,
        setValue,
        formState: { errors },
    } = useForm<ReservationDTO>({
        mode: 'onBlur',
        reValidateMode: 'onChange',
    });

    const [rooms, setRooms] = React.useState<Room[]>([]);
    const [loadingRooms, setLoadingRooms] = React.useState(false);
    const [dialogOpen, setDialogOpen] = React.useState(false);

    React.useEffect(() => {
        setLoadingRooms(true);
        axios
            .get(import.meta.env.VITE_APP_BACKEND_URL + '/api/room')
            .then((res) => setRooms(res.data))
            .catch(() => toast.error('Failed to load rooms'))
            .finally(() => setLoadingRooms(false));
    }, []);

    const onSubmit = async (data: ReservationDTO) => {
        if (data.startTime && data.endTime && data.startTime >= data.endTime) {
            toast.error('Start time must be before end time.');
            return;
        }
        if (!data.date) {
            toast.error('Please select a date.');
            return;
        }

        const now = new Date();
        const [year, month, day] = data.date.split('-');
        const [hour, minute] = data.startTime.split(':');
        const reservationStart = new Date(
            Number(year),
            Number(month) - 1,
            Number(day),
            Number(hour),
            Number(minute)
        );
        if (reservationStart < now) {
            toast.error('Reservation cannot be in the past.');
            return;
        }
        const payload = {
            ...data,
            roomId: data.roomId,
            date: data.date,
            startTime: data.startTime,
            endTime: data.endTime,
            description: data.description,
            participants: data.participants,
        };
        try {
            const res = await axios.post(
                import.meta.env.VITE_APP_BACKEND_URL + '/api/reservation',
                payload
            );
            if (typeof res.data === 'string' && res.status !== 200) {
                // Backend returned an error as a string
                toast.error(res.data);
                return;
            }
            toast.success('Reservation successfully created!');
            setDialogOpen(false);
            reset();
            // modify the current location URL to include the private key and reload the page
            const newUrl = new URL(window.location.href);
            newUrl.searchParams.set('privateKey', res.data.privateKey);
            window.history.pushState({}, '', newUrl.toString());
            window.location.reload();
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            const errorMessage =
                error?.response?.data?.error ||
                error?.response?.data?.message ||
                (typeof error?.response?.data === 'string' ? error.response.data : undefined) ||
                'Failed to create reservation';
            toast.error(errorMessage);
        }
    };
    return (
        <>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                    <Button onClick={() => setDialogOpen(true)}>
                        <LucideEdit />
                        <span className="hidden sm:inline">Create Reservation</span>
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Create a new Reservation</DialogTitle>
                        <DialogDescription>
                            Fill out the form below to create a new reservation. Ensure all fields
                            are filled out correctly.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <NewReservation
                            register={register}
                            watch={watch}
                            setValue={setValue}
                            errors={errors}
                            rooms={rooms}
                            loadingRooms={loadingRooms}
                        />
                        <DialogFooter>
                            <DialogClose asChild>
                                <Button variant={'secondary'}>Cancel</Button>
                            </DialogClose>
                            <Button type="submit" className="w-full sm:w-auto">
                                Create
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}

function NewReservation({
    register,
    watch,
    setValue,
    errors,
    rooms,
    loadingRooms,
}: {
    register: ReturnType<typeof useForm<ReservationDTO>>['register'];
    watch: ReturnType<typeof useForm<ReservationDTO>>['watch'];
    setValue: ReturnType<typeof useForm<ReservationDTO>>['setValue'];
    errors: FieldErrors<ReservationDTO>;
    rooms: Room[];
    loadingRooms: boolean;
}) {
    const selectedRoomId = watch('roomId');
    const selectedRoom = rooms.find((room) => room.id === selectedRoomId);

    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Date Field */}
                <div className="flex flex-col">
                    <Label>Date</Label>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                data-empty={!watch('date')}
                                className="data-[empty=true]:text-muted-foreground w-full justify-start text-left font-normal"
                            >
                                <CalendarIcon />
                                {watch('date') ? (
                                    format(new Date(watch('date')), 'PPP')
                                ) : (
                                    <span>Pick a date</span>
                                )}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                            <Calendar
                                mode="single"
                                selected={watch('date') ? new Date(watch('date')) : undefined}
                                disabled={
                                    (date) =>
                                        date <
                                        new Date(
                                            new Date().setHours(0, 0, 0, 0)
                                        ) /* || date.getDay() === 0 || date.getDay() === 6*/ // TODO: Disable weekends if needed check with others
                                }
                                onSelect={(date) => {
                                    if (date) {
                                        setValue('date', formatDateString(date), {
                                            shouldValidate: true,
                                        });
                                    }
                                }}
                            />
                        </PopoverContent>
                    </Popover>
                    {errors.date && (
                        <span className="text-destructive text-xs">{errors.date.message}</span>
                    )}
                </div>
                {/* Room Field */}
                <div>
                    <Label>Room</Label>
                    <Select
                        onValueChange={(val) => setValue('roomId', val, { shouldValidate: true })}
                        disabled={loadingRooms}
                        value={selectedRoomId}
                    >
                        <SelectTrigger
                            {...register('roomId', {
                                required: 'Room is required',
                            })}
                        >
                            <span>
                                {selectedRoom
                                    ? `Room ${selectedRoom.roomNumber}`
                                    : loadingRooms
                                      ? 'Loading rooms...'
                                      : 'Select a room'}
                            </span>
                        </SelectTrigger>
                        <SelectContent>
                            {rooms
                                .slice()
                                .sort((a, b) => Number(a.roomNumber) - Number(b.roomNumber))
                                .map((room) => (
                                    <SelectItem key={room.id} value={room.id}>
                                        <div className="flex flex-col gap-1">
                                            <span className="font-medium">
                                                Room {room.roomNumber}
                                            </span>
                                            <div className="flex flex-wrap gap-1 mt-1">
                                                {room.roomFeatures.map((feature) => (
                                                    <FeatureBadge key={feature} feature={feature} />
                                                ))}
                                            </div>
                                        </div>
                                    </SelectItem>
                                ))}
                        </SelectContent>
                    </Select>
                    {errors.roomId && (
                        <span className="text-destructive text-xs">{errors.roomId.message}</span>
                    )}
                </div>
                {/* Start Time Field */}
                <div>
                    <Label>Start Time</Label>
                    <Select
                        onValueChange={(val) =>
                            setValue('startTime', val, { shouldValidate: true })
                        }
                    >
                        <SelectTrigger
                            {...register('startTime', {
                                required: 'Start time is required',
                                pattern: {
                                    value: /^([01]\d|2[0-3]):[0-5]\d$/,
                                    message: 'Invalid time format',
                                },
                            })}
                        >
                            <SelectValue placeholder="Select start time" />
                        </SelectTrigger>
                        <SelectContent>
                            {Array.from({ length: 31 }, (_, i) => {
                                const hour = 6 + Math.floor(i / 2);
                                const minute = i % 2 === 0 ? '00' : '30';
                                const time = `${hour.toString().padStart(2, '0')}:${minute}`;
                                return (
                                    <SelectItem key={time} value={time}>
                                        {time}
                                    </SelectItem>
                                );
                            })}
                        </SelectContent>
                    </Select>
                    {errors.startTime && (
                        <span className="text-destructive text-xs">{errors.startTime.message}</span>
                    )}
                </div>
                {/* End Time Field */}
                <div>
                    <Label>End Time</Label>
                    <Select
                        onValueChange={(val) => setValue('endTime', val, { shouldValidate: true })}
                    >
                        <SelectTrigger
                            {...register('endTime', {
                                required: 'End time is required',
                                pattern: {
                                    value: /^([01]\d|2[0-3]):[0-5]\d$/,
                                    message: 'Invalid time format',
                                },
                            })}
                        >
                            <SelectValue placeholder="Select end time" />
                        </SelectTrigger>
                        <SelectContent>
                            {Array.from({ length: 31 }, (_, i) => {
                                const hour = 6 + Math.floor(i / 2);
                                const minute = i % 2 === 0 ? '00' : '30';
                                const time = `${hour.toString().padStart(2, '0')}:${minute}`;
                                return (
                                    <SelectItem key={time} value={time}>
                                        {time}
                                    </SelectItem>
                                );
                            })}
                        </SelectContent>
                    </Select>
                    {errors.endTime && (
                        <span className="text-destructive text-xs">{errors.endTime.message}</span>
                    )}
                </div>
            </div>
            {/* Description Field */}
            <div>
                <Label>Description</Label>
                <Textarea
                    {...register('description', {
                        required: 'Description is required',
                        maxLength: { value: 200, message: 'Max 200 characters' },
                    })}
                    placeholder="Enter a description for your reservation"
                    className="resize-none"
                />
                {errors.description && (
                    <span className="text-destructive text-xs">{errors.description.message}</span>
                )}
                <p className="text-sm text-muted-foreground">
                    Briefly describe the purpose of your reservation.
                </p>
            </div>
            {/* Participants Field */}
            <div>
                <Label>Participants</Label>
                <Input
                    placeholder="John, Jane, Alex"
                    {...register('participants', {
                        required: 'Participants are required',
                        maxLength: { value: 255, message: 'Max 255 characters' },
                        pattern: {
                            value: /^[A-Za-zÄäÖöÜüßèéêç\s]+(,\s*[A-Za-zÄäÖöÜüßèéêç\s]+)*$/,
                            message: 'Only letters, spaces, and commas allowed',
                        },
                    })}
                />
                {errors.participants && (
                    <span className="text-destructive text-xs">{errors.participants.message}</span>
                )}
                <p className="text-sm text-muted-foreground">
                    Enter participant names separated by commas (letters only).
                </p>
            </div>
        </>
    );
}

function formatDateString(dateString: string | Date): string {
    const date = new Date(dateString);
    return (
        date.toLocaleString('default', { year: 'numeric' }) +
        '-' +
        date.toLocaleString('default', { month: '2-digit' }) +
        '-' +
        date.toLocaleString('default', { day: '2-digit' })
    );
}
