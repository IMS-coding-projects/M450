import { ModeToggle } from '@/components/ui/mode-toggle.tsx';
import logo_dark from '/logo-oa-dark.svg';
import logo_light from '/logo-oa-light.svg';
import NewReservationDialog from '@/components/dialogs/NewReservationDialog.tsx';

export default function Header() {
    return (
        <>
            <header
                className={
                    'flex items-center justify-between p-3 bg-secondary text-secondary-foreground'
                }
            >
                <div className={'flex items-center gap-2'}>
                    <img
                        className="hover:cursor-pointer hidden dark:block"
                        src={logo_dark}
                        alt="OrariAperti Logo"
                        style={{ width: '80px', height: '40px' }}
                    />
                    <img
                        className="hover:cursor-pointer dark:hidden"
                        src={logo_light}
                        alt="OrariAperti Logo"
                        style={{ width: '80px', height: '40px' }}
                    />
                    <div className={'flex flex-col'}>
                        <span className={'text-3xl font-bold'}>OrariAperti</span>
                    </div>
                </div>

                <div className={'flex items-center gap-4 '}>
                    <NewReservationDialog />
                    <ModeToggle />
                </div>
            </header>
        </>
    );
}
