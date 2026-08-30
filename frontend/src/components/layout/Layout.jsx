import Sidebar from "./Sidebar";
import Header from './Header';

function Layout({ children }) {
    return (
        <div>
            <Sidebar />
            <div>
                <Header />
                <main>
                    {children}
                </main>
            </div>
        </div>
    )
}

export default Layout