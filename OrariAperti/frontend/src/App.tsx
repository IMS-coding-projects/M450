import { ThemeProvider } from '@/components/ui/theme-provider.tsx';
import Header from '@/components/Header.tsx';
import Main from '@/components/Main.tsx';
import Footer from '@/components/Footer.tsx';
import { Toaster } from '@/components/ui/sonner.tsx';

function App() {
    return (
        <>
            <ThemeProvider>
                <Header />
                <Main />
                <Footer />
                <Toaster />
            </ThemeProvider>
        </>
    );
}

export default App;
