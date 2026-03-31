import * as React from 'react';
import {
    Projector,
    Droplet,
    Clipboard,
    Snowflake,
    Monitor,
    Volume2,
    Video,
    Wifi,
    Plug,
    Sun,
    Shield,
    MonitorSmartphone,
    Phone,
    Coffee,
    Printer,
    Lock,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge.tsx';
import type { RoomFeature } from '@/types/types.ts';

const featureIconMap: Record<RoomFeature, React.ElementType> = {
    Beamer: Projector,
    'Water Tap': Droplet,
    Whiteboard: Clipboard,
    'Air Conditioning': Snowflake,
    'Projector Screen': Monitor,
    'Speaker System': Volume2,
    'Video Conferencing': Video,
    WiFi: Wifi,
    'Power Outlets': Plug,
    'Natural Light': Sun,
    Soundproofing: Shield,
    'Smart Board': MonitorSmartphone,
    Telephone: Phone,
    'Coffee Machine': Coffee,
    Printer: Printer,
    Lockers: Lock,
};

const validFeatures = Object.keys(featureIconMap);

export function FeatureBadge({ feature }: { feature: string }) {
    const isValid = validFeatures.includes(feature);
    const Icon = isValid ? featureIconMap[feature as RoomFeature] : undefined;
    return (
        <Badge variant={'outline'}>
            {Icon && <Icon size={16} />}
            {feature.replace(/_/g, ' ')}
        </Badge>
    );
}
