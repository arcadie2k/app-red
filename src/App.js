import { useState, useEffect, useCallback } from "react";
import ExcelClients from "./contexts/ExcelClients";
import Alerts from "./contexts/Alerts";
import Load from "./components/Load";
import SearchClient from "./components/SearchClient";
import ViewClients from "./components/ViewClients";
import axios from "axios";

const App = () => {
    const [activeTab, setActiveTab] = useState(0);
    const [excelClients, setExcelClients] = useState([]);
    const [alerts, setAlerts] = useState([]);

    useEffect(() => {
        axios.defaults.baseURL = `http://${process.env.REACT_APP_NETWORK_ADDRESS}:8080`;
    }, []);

    return (
        <ExcelClients.Provider
            value={{
                excelClients,
                setExcelClients,
            }}
        >
            <main className="relative min-h-screen">
                <Alerts>
                    {!excelClients.length ? (
                        <Load />
                    ) : (
                        <section className="p-4">
                            {/* Navbar */}
                            <ul className="flex flex-wrap text-sm font-medium text-center text-gray-500 border-gray-200">
                                <li className="mr-1 cursor-pointer" onClick={() => setActiveTab(0)}>
                                    <p
                                        className={`inline-block p-4  rounded-t-lg ${
                                            activeTab === 0
                                                ? "text-blue-600 bg-gray-100"
                                                : "hover:text-gray-600 hover:bg-gray-50"
                                        }`}
                                    >
                                        Caută client
                                    </p>
                                </li>
                                <li className="cursor-pointer" onClick={() => setActiveTab(1)}>
                                    <p
                                        className={`inline-block p-4 rounded-t-lg ${
                                            activeTab === 1
                                                ? "text-blue-600 bg-gray-100"
                                                : "hover:text-gray-600 hover:bg-gray-50"
                                        } `}
                                    >
                                        Vezi clienți
                                    </p>
                                </li>
                            </ul>

                            {/* Routing */}
                            <div className="bg-gray-100 pt-2 rounded-xl rounded-tl-none overflow-hidden">
                                {activeTab === 0 ? <SearchClient /> : <ViewClients />}
                            </div>
                        </section>
                    )}
                </Alerts>
            </main>
        </ExcelClients.Provider>
    );
};

export default App;
