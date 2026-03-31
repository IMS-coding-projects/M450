import github_light from '/github-logo-light.svg';
import github_dark from '/github-logo-dark.svg';

export default function Footer() {
    return (
        <>
            <footer className="bg-secondary text-secondary-foreground py-3">
                <div className="container mx-auto text-center text-sm flex items-center justify-between px-3">
                    <div />
                    <p>&copy; {new Date().getFullYear()} OrariAperti. All rights reserved.</p>
                    <img
                        className="hover:cursor-pointer hidden dark:block"
                        onClick={() =>
                            window.open('https://github.com/IMS-coding-projects/m223', '_blank')
                        }
                        src={github_dark}
                        alt="GitHub Repository"
                        style={{ width: '25px', height: '25px' }}
                    />
                    <img
                        className="hover:cursor-pointer dark:hidden"
                        onClick={() =>
                            window.open('https://github.com/IMS-coding-projects/m223', '_blank')
                        }
                        src={github_light}
                        alt="GitHub Repository"
                        style={{ width: '25px', height: '25px' }}
                    />
                </div>
            </footer>
        </>
    );
}
