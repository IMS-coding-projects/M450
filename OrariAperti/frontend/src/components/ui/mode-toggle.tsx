import { LucideComputer, Moon, Sun } from 'lucide-react';

import { Button } from '@/components/ui/button.tsx';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu.tsx';
import { useTheme } from '@/components/ui/theme-provider.tsx';

export function ModeToggle() {
    const { setTheme } = useTheme();

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="outline"
                    className={
                        'border-0 hover:cursor-pointer bg-secondary hover:bg-secondary hover:text-primary '
                    }
                    size="icon"
                >
                    <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                    <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                    <span className="sr-only">Toggle theme</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className={'w-32'}>
                <DropdownMenuItem
                    className={'hover:cursor-pointer'}
                    onClick={() => setTheme('light')}
                >
                    <Sun />
                    Light
                </DropdownMenuItem>
                <DropdownMenuItem
                    className={'hover:cursor-pointer'}
                    onClick={() => setTheme('dark')}
                >
                    <Moon />
                    Dark
                </DropdownMenuItem>
                <DropdownMenuItem
                    className={'hover:cursor-pointer'}
                    onClick={() => setTheme('system')}
                >
                    <LucideComputer />
                    System
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
