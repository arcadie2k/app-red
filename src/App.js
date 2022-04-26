import { useState, useEffect } from "react";
import Load from "./components/Load";
import SearchClient from "./components/SearchClient";
import ViewClients from "./components/ViewClients";
import ExcelClients from "./contexts/ExcelClients";
import axios from "axios";

const App = () => {
    const [activeTab, setActiveTab] = useState(0);
    const [clients, setClients] = useState([]);
    const [excelClients, setExcelClients] = useState([]);

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
            <main>
                {!excelClients.length ? (
                    <Load />
                ) : (
                    <section className="px-2 pt-2">
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
                                    Cauta client
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
                                    Vezi clienti
                                </p>
                            </li>
                        </ul>

                        {/* Routing */}
                        <div className="bg-gray-100 pt-2 rounded-lg rounded-tl-none overflow-hidden">
                            {activeTab === 0 ? (
                                <SearchClient clients={clients} setClients={setClients} />
                            ) : (
                                <ViewClients clients={clients} setClients={setClients} />
                            )}
                        </div>
                    </section>
                )}
            </main>
        </ExcelClients.Provider>
    );
};

export default App;
