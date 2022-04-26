import axios from "axios";
import React, { useState, useContext, useCallback, useEffect } from "react";
import * as XLSX from "xlsx";
import Button from "./Button";
import Datepicker from "./Datepicker";
import { combineClients, formatDate, getClients } from "../utils";
import ExcelClients from "../contexts/ExcelClients";

const ViewClients = ({ clients, setClients }) => {
    const thClass = "font-medium text-gray-900 px-2 py-4 border-r";
    const tdClass = "text-sm text-gray-900 px-2 py-2 border-r";

    const { excelClients } = useContext(ExcelClients);
    const [DBClients, setDBClients] = useState([]);
    const [filteredClients, setFilteredClients] = useState([]);

    const [startDate, setStartDate] = useState(() => {
        const date = new Date();
        date.setHours(0, 0, 0, 0);
        return date;
    });

    const [endDate, setEndDate] = useState(() => {
        const date = new Date();
        date.setHours(0, 0, 0, 0);
        return date;
    });

    const [filter, setFilter] = useState(false);

    /**
     * Initially fetch clients from DB
     */
    useEffect(() => {
        (async () => {
            const clients = await getClients();
            setDBClients(clients);
        })();
    }, []);

    /**
     * Filter on date change
     */
    useEffect(() => {
        if (!DBClients.length) return;
        const newClients = combineClients(excelClients, DBClients).filter((client) => {
            if (!client.fromDB) return false;

            const clientUpdatedAt = new Date(Number(client.updatedAt));
            clientUpdatedAt.setHours(0, 0, 0, 0);

            if (clientUpdatedAt < startDate || clientUpdatedAt > endDate) return false;

            if (filter && (client.sentAt !== null || !client.Email.length)) return false;

            return true;
        });

        setFilteredClients(newClients);
    }, [DBClients, excelClients, startDate, endDate, filter]);

    const exportExcel = useCallback((clients, filename = null) => {
        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils.json_to_sheet(
            clients.map((client) => {
                const newClient = { ...client, "trimis la": client.sentAt !== null ? formatDate(client.sentAt) : "" };
                delete newClient.Telefon_1;
                delete newClient.Telefon_2;
                delete newClient.fromDB;
                delete newClient.createdAt;
                delete newClient.updatedAt;
                delete newClient.sentAt;
                return newClient;
            })
        );

        XLSX.utils.book_append_sheet(workbook, worksheet, "clients");
        XLSX.writeFileXLSX(workbook, filename !== null ? filename : `DR-${formatDate(new Date())}.xlsx`);
    }, []);

    const sendAndExport = useCallback(async () => {
        if (!filteredClients.length) return;
        const clientsToExport = [];

        const newClients = [...DBClients];
        for (const client of filteredClients) {
            try {
                const res = await axios.put("/sendClient", {
                    Cont: client.Cont,
                });

                const clientIndex = DBClients.findIndex((c) => c.Cont === client.Cont);

                if (clientIndex > -1) {
                    newClients[clientIndex] = { ...newClients[clientIndex], ...res.data };
                    clientsToExport.push(newClients[clientIndex]);
                }
            } catch (err) {
                console.error(err);
            }
        }

        exportExcel(clientsToExport);
        setDBClients(newClients);
    }, [filteredClients, DBClients, exportExcel]);

    return (
        <div className="p-8">
            <div className="flex items-start justify-start mb-4 space-x-4">
                <div className="w-full max-w-md">
                    <label class="block mb-2 pl-2 text-sm font-medium text-gray-900">De la</label>
                    <Datepicker value={startDate} setValue={setStartDate} />
                </div>
                <div className="w-full max-w-md">
                    <label class="block mb-2 pl-2 text-sm font-medium text-gray-900">Pana la</label>
                    <Datepicker value={endDate} setValue={setEndDate} />
                </div>
            </div>
            <div>
                <div class="flex items-start mb-4">
                    <div class="flex items-center h-5 cursor-pointer">
                        <input
                            id="filter"
                            type="checkbox"
                            className="w-4 h-4 bg-gray-50 rounded border border-gray-300 focus:ring-3 focus:ring-blue-300 dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-blue-600 dark:ring-offset-gray-800"
                            checked={filter}
                            onClick={() => setFilter(!filter)}
                        />
                    </div>
                    <div class="ml-3 text-sm">
                        <label htmlFor="filter" class="font-medium text-gray-900 dark:text-gray-300">
                            Arata doar ne-trimisi
                        </label>
                    </div>
                </div>
            </div>

            <table className="min-w-full border text-center mb-8 bg-white">
                <thead className="border-b border-">
                    <th className={thClass}>Cont</th>
                    <th className={thClass}>Consumator</th>
                    <th className={thClass}>Adresa</th>
                    <th className={thClass}>Fix1</th>
                    <th className={thClass}>Mobil1</th>
                    <th className={thClass}>Fix2</th>
                    <th className={thClass}>Mobil2</th>
                    <th className={thClass}>Email</th>
                    <th className={thClass}>D. modificare</th>
                    <th className={thClass}>D. transmitere</th>
                </thead>
                <tbody>
                    {filteredClients.map((client) => (
                        <tr key={client.Cont} className="border-b">
                            <td className={tdClass}>{client.Cont}</td>
                            <td className={tdClass}>{client.Consumator}</td>
                            <td className={tdClass}>{client.Adresa}</td>
                            <td className={tdClass}>{client.Fix1}</td>
                            <td className={tdClass}>{client.Mobil1}</td>
                            <td className={tdClass}>{client.Fix2}</td>
                            <td className={tdClass}>{client.Mobil2}</td>
                            <td className={tdClass}>{client.Email}</td>
                            <td className={tdClass}>{formatDate(client.updatedAt)}</td>
                            <td className={tdClass}>{client.sentAt !== null ? formatDate(client.sentAt) : ""}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <div className="flex items-center space-x-2">
                <Button type="purple" onClick={sendAndExport} disabled={!filter || !filteredClients.length}>
                    Send all
                </Button>
                <Button type="green" onClick={() => exportExcel(DBClients, "CLIENTI.xlsx")}>
                    Export all from DB
                </Button>
                <Button
                    type="green"
                    onClick={() => exportExcel(combineClients(excelClients, DBClients), "CLIENTI.xlsx")}
                >
                    Export all from Excel + DB
                </Button>
            </div>
        </div>
    );
};

export default ViewClients;
