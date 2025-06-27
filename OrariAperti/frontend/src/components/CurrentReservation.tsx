import * as React from "react";
import {
    Card,
    CardHeader,
    CardTitle,
    CardContent,
    CardDescription,
    CardFooter, CardAction,
} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Textarea} from "@/components/ui/textarea";
import type {Reservation, Room, ReservationDTO} from "@/types/types";
import NewReservationDialog from "@/components/dialogs/NewReservationDialog";
import {toast} from "sonner";
import {CalendarIcon, CircleX, LucideEdit2, LucideLink, Save, LucideTriangleAlert} from "lucide-react";
import {FeatureBadge} from "@/components/FeatureBadge";
import {format} from "date-fns";
import DeleteSingleReservationDialog from "@/components/dialogs/DeleteSingleReservationDialog.tsx";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover.tsx";
import {Calendar} from "@/components/ui/calendar.tsx";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select.tsx";
import {useForm} from "react-hook-form";
import {HoverCard, HoverCardTrigger, HoverCardContent} from "@/components/ui/hover-card.tsx";
import {Alert, AlertDescription, AlertTitle} from "@/components/ui/alert.tsx";

const API_URL = import.meta.env.VITE_APP_BACKEND_URL;

function formatDateString(dateString: string | Date): string {
    const date = new Date(dateString);
    return (
        date.toLocaleString("default", {year: "numeric"}) +
        "-" +
        date.toLocaleString("default", {month: "2-digit"}) +
        "-" +
        date.toLocaleString("default", {day: "2-digit"})
    );
}

export default function CurrentReservation({reservation}: { reservation?: Reservation }) {
    const [editing, setEditing] = React.useState(false);
    const [saving, setSaving] = React.useState(false);
    const [deleting, setDeleting] = React.useState(false);
    const [rooms, setRooms] = React.useState<Room[]>([]);
    const [loadingRooms, setLoadingRooms] = React.useState(false);

    const isPrivate = !!reservation && (document.querySelector<HTMLInputElement>('#privateKey')?.value === reservation.privateKey);

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        formState: {errors},
        reset,
    } = useForm<ReservationDTO>({
        mode: "onBlur",
        reValidateMode: "onChange",
        defaultValues: reservation
            ? {
                date: reservation.date,
                startTime: reservation.startTime.substring(0, reservation.startTime.length - 3),
                endTime: reservation.endTime.substring(0, reservation.endTime.length - 3),
                roomId: reservation.room?.id ?? "",
                description: reservation.description,
                participants: reservation.participants,
            }
            : undefined,
    });

    React.useEffect(() => {
        if (editing) {
            setLoadingRooms(true);
            fetch(`${API_URL}/api/room`)
                .then(res => res.json())
                .then(setRooms)
                .catch(() => toast.error("Failed to load rooms"))
                .finally(() => setLoadingRooms(false));
        }
    }, [editing]);

    React.useEffect(() => {
        // Reset form when reservation changes
        if (reservation) {
            reset({
                date: reservation.date,
                startTime: reservation.startTime.substring(0, reservation.startTime.length - 3),
                endTime: reservation.endTime.substring(0, reservation.endTime.length - 3),
                roomId: reservation.room?.id ?? "",
                description: reservation.description,
                participants: reservation.participants,
            });
        }
    }, [reservation, reset]);

    function handleCopyLink() {
        const url = new URL(window.location.href);
        if (reservation?.publicKey) {
            url.searchParams.set("publicKey", reservation.publicKey);
            url.searchParams.delete("privateKey");
        }
        navigator.clipboard.writeText(url.toString()).then();
        toast.success("Shareable link copied!");
    }

    async function onEditSubmit(data: ReservationDTO) {
        setSaving(true);
        if (!reservation) {
            toast.error("No reservation to update");
            setSaving(false);
            return;
        }
        // Validate date
        if (!data.date || !data.startTime || !data.endTime) {
            toast.error("Please fill in all required fields");
            setSaving(false);
            return;
        }
        const now = new Date();
        const [year, month, day] = data.date.split("-");
        const [hour, minute] = data.startTime.split(":");
        const reservationStart = new Date(
            Number(year),
            Number(month) - 1,
            Number(day),
            Number(hour),
            Number(minute)
        );
        if (reservationStart < now) {
            toast.error("Reservation cannot be in the past.");
            setSaving(false);
            return;
        }
        if (data.startTime >= data.endTime) {
            toast.error("End time must be after start time");
            setSaving(false);
            return;
        }

        try {
            const payload = {
                ...data,
            };
            const res = await fetch(`${API_URL}/api/reservation/${reservation?.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    privateKey: reservation?.privateKey || "",
                },
                body: JSON.stringify(payload),
            });
            if (!res.ok) {
                const msg = await res.text();
                throw new Error(msg || "Failed to update reservation");
            }
            toast.success("Reservation updated!", {
                description: "The site will refresh automatically in 4.5 seconds to show the accurate information...",
                duration: 4500
            });
            const url = new URL(window.location.href);
            url.searchParams.set("privateKey", reservation?.privateKey || "");
            url.searchParams.delete("publicKey");
            window.history.replaceState({}, "", url.toString());
            setTimeout(() => {
                window.location.reload();
            }, 3000);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
            toast.error(err?.message || "Failed to update reservation");
        } finally {
            setSaving(false);
        }
    }

    async function handleDelete() {
        if (!reservation) return;
        setDeleting(true);
        try {
            const res = await fetch(`${API_URL}/api/reservation/${reservation.id}`, {
                method: "DELETE",
                headers: {
                    privateKey: reservation?.privateKey || "",
                },
            });
            if (!res.ok) {
                const msg = await res.text();
                throw new Error(msg || "Failed to delete reservation");
            }
            toast.success("Reservation deleted!", {description: "Redirecting to home in 3 seconds...", duration: 3000});
            const url = new URL(window.location.href);
            url.searchParams.delete("privateKey");
            url.searchParams.delete("publicKey");
            window.history.replaceState({}, "", url.toString());
            setTimeout(() => {
                window.location.href = "/";
            }, 3000);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
            toast.error(err.message || "Failed to delete reservation");
        } finally {
            setDeleting(false);
        }
    }

    if (!reservation) {
        return (
            <Card className="h-full w-full">
                <CardHeader>
                    <CardTitle>No Current Reservation</CardTitle>
                    <CardDescription>
                        Please enter the provided keys on the Access Key Panel or create a new Reservation
                    </CardDescription>
                    <CardAction>
                        <NewReservationDialog/>
                    </CardAction>
                </CardHeader>
            </Card>
        );
    }

    if (editing) {
        const selectedRoomId = watch("roomId");
        const selectedRoom = rooms.find((room) => room.id === selectedRoomId);

        return (
            <Card className="h-full w-full">
                <form onSubmit={handleSubmit(onEditSubmit)}>
                    <CardHeader className={"mb-4"}>
                        <CardTitle>Edit Reservation</CardTitle>
                        <CardDescription>
                            Update your reservation details below.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Date Field */}
                            <div className="flex flex-col">
                                <Label>Date</Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            data-empty={!watch("date")}
                                            className="data-[empty=true]:text-muted-foreground w-full justify-start text-left font-normal"
                                            type="button"
                                        >
                                            <CalendarIcon/>
                                            {watch("date") ? (
                                                format(new Date(watch("date")), "PPP")
                                            ) : (
                                                <span>Pick a date</span>
                                            )}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0">
                                        <Calendar
                                            mode="single"
                                            selected={watch("date") ? new Date(watch("date")) : undefined}
                                            disabled={(date) =>
                                                date < new Date(new Date().setHours(0, 0, 0, 0))
                                            }
                                            onSelect={(date) => {
                                                if (date) {
                                                    setValue("date", formatDateString(date), {
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
                                    onValueChange={(val) =>
                                        setValue("roomId", val, {shouldValidate: true})
                                    }
                                    disabled={loadingRooms}
                                    value={selectedRoomId}
                                >
                                    <SelectTrigger
                                        {...register("roomId", {
                                            required: "Room is required",
                                        })}
                                    >
                                        <span>
                                            {selectedRoom
                                                ? `Room ${selectedRoom.roomNumber}`
                                                : loadingRooms
                                                    ? "Loading rooms..."
                                                    : "Select a room"}
                                        </span>
                                    </SelectTrigger>
                                    <SelectContent>
                                        {rooms
                                            .slice()
                                            .sort((a, b) => Number(a.roomNumber) - Number(b.roomNumber))
                                            .map((room) => (
                                                <SelectItem key={room.id} value={room.id}>
                                                    <div className="flex flex-col gap-1">
                                                        <span className="font-medium">Room {room.roomNumber}</span>
                                                        <div className="flex flex-wrap gap-1 mt-1">
                                                            {room.roomFeatures.map((feature) => (
                                                                <FeatureBadge key={feature} feature={feature}/>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </SelectItem>
                                            ))}
                                    </SelectContent>
                                </Select>
                                {errors.roomId && (
                                    <span className="text-destructive text-xs">
                                        {errors.roomId.message}
                                    </span>
                                )}
                            </div>
                            {/* Start Time Field */}
                            <div>
                                <Label>Start Time</Label>
                                <Select
                                    onValueChange={(val) =>
                                        setValue("startTime", val, {shouldValidate: true})
                                    }
                                    value={watch("startTime")}
                                >
                                    <SelectTrigger
                                        {...register("startTime", {
                                            required: "Start time is required",
                                            pattern: {
                                                value: /^([01]\d|2[0-3]):[0-5]\d$/,
                                                message: "Invalid time format",
                                            },
                                        })}
                                    >
                                        <SelectValue
                                            defaultValue={reservation.startTime.substring(0, reservation.startTime.length - 3)}/>
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Array.from({length: 31}, (_, i) => {
                                            const hour = 6 + Math.floor(i / 2);
                                            const minute = i % 2 === 0 ? "00" : "30";
                                            const time = `${hour.toString().padStart(2, "0")}:${minute}`;
                                            return (
                                                <SelectItem key={time} value={time}>
                                                    {time}
                                                </SelectItem>
                                            );
                                        })}
                                    </SelectContent>
                                </Select>
                                {errors.startTime && (
                                    <span className="text-destructive text-xs">
                                        {errors.startTime.message}
                                    </span>
                                )}
                            </div>
                            {/* End Time Field */}
                            <div>
                                <Label>End Time</Label>
                                <Select
                                    onValueChange={(val) =>
                                        setValue("endTime", val, {shouldValidate: true})
                                    }
                                    value={watch("endTime")}
                                >
                                    <SelectTrigger
                                        {...register("endTime", {
                                            required: "End time is required",
                                            pattern: {
                                                value: /^([01]\d|2[0-3]):[0-5]\d$/,
                                                message: "Invalid time format",
                                            },
                                        })}
                                    >
                                        <SelectValue
                                            defaultValue={reservation.endTime.substring(0, reservation.endTime.length - 3)}/>
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Array.from({length: 31}, (_, i) => {
                                            const hour = 6 + Math.floor(i / 2);
                                            const minute = i % 2 === 0 ? "00" : "30";
                                            const time = `${hour.toString().padStart(2, "0")}:${minute}`;
                                            return (
                                                <SelectItem key={time} value={time}>
                                                    {time}
                                                </SelectItem>
                                            );
                                        })}
                                    </SelectContent>
                                </Select>
                                {errors.endTime && (
                                    <span className="text-destructive text-xs">
                                        {errors.endTime.message}
                                    </span>
                                )}
                            </div>
                        </div>
                        {/* Description Field */}
                        <div>
                            <Label>Description</Label>
                            <Textarea
                                {...register("description", {
                                    required: "Description is required",
                                    maxLength: {value: 200, message: "Max 200 characters"},
                                })}
                                placeholder="Enter a description for your reservation"
                                className="resize-none"
                            />
                            {errors.description && (
                                <span className="text-destructive text-xs">
                                    {errors.description.message}
                                </span>
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
                                {...register("participants", {
                                    required: "Participants are required",
                                    maxLength: {value: 255, message: "Max 255 characters"},
                                    pattern: {
                                        value: /^[A-Za-zÄäÖöÜüßèéêç\s]+(,\s*[A-Za-zÄäÖöÜüßèéêç\s]+)*$/,
                                        message: "Only letters, spaces, and commas allowed",
                                    },
                                })}
                            />
                            {errors.participants && (
                                <span className="text-destructive text-xs">
                                    {errors.participants.message}
                                </span>
                            )}
                            <p className="text-sm text-muted-foreground">
                                Enter participant names separated by commas (letters only).
                            </p>
                        </div>
                    </CardContent>
                    <CardFooter className="flex gap-2 mt-4">
                        <Button type="button" className={"w-1/2"} variant="secondary" onClick={() => setEditing(false)}>
                            <CircleX/>Cancel Editing
                        </Button>
                        <Button type="submit" className={"w-1/2"} disabled={saving}>
                            {saving ? "Saving..." : <><Save/>Save</>}
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        );
    }

    return (
        <>
            <Card className="h-full w-full">
                <CardHeader>
                    <CardTitle>
                        Reservation for Room {reservation.room?.roomNumber}
                    </CardTitle>
                    <CardDescription>
                        {reservation.date && (
                            <span>
                                {format(new Date(reservation.date), "PPP")}
                                {" · "}
                                {reservation.startTime} - {reservation.endTime}
                            </span>
                        )}
                    </CardDescription>
                    <CardAction>
                        <Button
                            onClick={handleCopyLink}
                            title="Copy shareable link"
                        >
                            <LucideLink size={16}/>
                            Share
                        </Button>
                    </CardAction>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <Label>Room {reservation.room?.roomNumber} Features</Label>
                        <div className="flex flex-wrap gap-1 mt-1">
                            {reservation.room?.roomFeatures?.map(f => (
                                <FeatureBadge key={f} feature={f}/>
                            ))}
                        </div>
                    </div>
                    <div>
                        <Label>Description</Label>
                        <Textarea value={reservation.description} className={"bg-muted resize-none"} readOnly={true}/>
                    </div>
                    <div>
                        <Label>Participants</Label>
                        <Textarea value={reservation.participants} className={"bg-muted resize-none"} readOnly={true}/>
                    </div>
                    <div>
                        <div className="flex flex-col gap-1">
                            {reservation.privateKey && (

                                <>
                                    <HoverCard>
                                        <HoverCardTrigger asChild>
                                            <div>
                                                <Label htmlFor={"privatekey-input-current"}
                                                       className={"cursor-pointer"}>Private Key</Label>
                                                <Input
                                                    id="privatekey-input-current"
                                                    type="text"
                                                    value={reservation.privateKey}
                                                    readOnly
                                                    className="bg-muted mb-3 cursor-pointer select-all"
                                                    onClick={e => {
                                                        (e.target as HTMLInputElement).select();
                                                        navigator.clipboard.writeText(reservation.privateKey).then();
                                                        toast.success("Private key copied to clipboard!");
                                                    }}/>
                                            </div>
                                        </HoverCardTrigger>
                                        <HoverCardContent asChild>
                                            <Alert variant={"destructive"}>
                                                <AlertTitle className={"text-xs flex gap-1 text-destructive"}>
                                                    <LucideTriangleAlert size={30} className={"mt-[1px]"}/>
                                                    Never share your private key with anyone.
                                                </AlertTitle>
                                                <AlertDescription className={"text-xs"}>
                                                    It is used to securely access and manage your reservations.
                                                    Sharing it will allow others to edit or delete your reservations.
                                                </AlertDescription>
                                            </Alert>
                                        </HoverCardContent>
                                    </HoverCard>
                                </>
                            )}
                            {reservation.publicKey && (
                                <>
                                    <HoverCard>
                                        <HoverCardTrigger asChild>
                                            <div>
                                                <Label htmlFor={"publickey-input-current"} className={"cursor-pointer"}>Public
                                                                                                                        Key</Label>
                                                <Input
                                                    id="publickey-input-current"
                                                    type="text"
                                                    value={reservation.publicKey}
                                                    readOnly
                                                    className="bg-muted cursor-pointer select-all"
                                                    onClick={e => {
                                                        (e.target as HTMLInputElement).select();
                                                        navigator.clipboard.writeText(reservation.publicKey).then();
                                                        toast.success("Public key copied to clipboard!");
                                                    }}/>
                                            </div>
                                        </HoverCardTrigger>
                                        <HoverCardContent asChild onClick={() => {
                                            handleCopyLink()
                                        }} className={"hover:cursor-pointer"}>
                                            <Alert>
                                                <AlertTitle className={"text-xs flex gap-1"}>
                                                    <LucideLink size={15}/>
                                                    Share your public key
                                                </AlertTitle>
                                                <AlertDescription className={"text-xs"}>
                                                    Share your public key with others to allow them to view your
                                                    reservations without giving them access to manage them. You can
                                                    click on me to copy it to your clipboard.
                                                </AlertDescription>
                                            </Alert>
                                        </HoverCardContent>
                                    </HoverCard>
                                </>
                            )}
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="flex gap-2">
                    {isPrivate && (
                        <>
                            {new Date(reservation.date) >= new Date(new Date().setHours(0, 0, 0, 0)) && (
                                <Button
                                    variant="secondary"
                                    onClick={() => setEditing(true)}
                                    title="Edit reservation"
                                    className={"w-1/2"}
                                >
                                    <LucideEdit2/>
                                    Edit
                                </Button>
                            )}
                            <DeleteSingleReservationDialog deleting={deleting} onDelete={handleDelete}/>
                        </>
                    )}
                </CardFooter>
            </Card>
        </>
    );
}