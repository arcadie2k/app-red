import axios from "axios";
import React, { useState, useContext, useCallback, useEffect } from "react";
import * as XLSX from "xlsx";
import ExcelClients from "../contexts/ExcelClients";
import { AlertsContext } from "../contexts/Alerts";
import Button from "./Button";
import Datepicker from "./Datepicker";
import Checkbox from "./Checkbox";
import { combineClients, formatDate, getClients } from "../utils";

const ViewClients = () => {
    const thClass = "text-xs text-gray-900 px-2 py-4 border-r font-bold uppercase";
    const tdClass = "text-sm text-gray-900 p-2 border-r";

    const { excelClients } = useContext(ExcelClients);
    const { makeAlert } = useContext(AlertsContext);
    const [DBClients, setDBClients] = useState([]);
    const [filteredClients, setFilteredClients] = useState([]);
    const [loading, setLoading] = useState(null);

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
        setLoading("sendAndExport");

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
        setLoading(null);
        makeAlert(`${clientsToExport.length} clienți au fost trimiși!`);
    }, [filteredClients, DBClients, exportExcel]);

    return (
        <div className="p-8">
            <div className="flex items-start justify-start mb-4 space-x-4">
                <div className="w-full max-w-md">
                    <label class="block mb-2 pl-2 text-sm font-medium text-gray-900">De la</label>
                    <Datepicker value={startDate} setValue={setStartDate} />
                </div>
                <div className="w-full max-w-md">
                    <label class="block mb-2 pl-2 text-sm font-medium text-gray-900">Pâna la</label>
                    <Datepicker value={endDate} setValue={setEndDate} />
                </div>
            </div>

            {/* Filter unsent */}
            <div className="mb-4">
                <Checkbox checked={filter} setChecked={setFilter} label="Arată doar ne-trimiși" />
            </div>

            <table className="min-w-full border text-center mb-8 bg-white">
                <thead className="border-b border-">
                    <th className={thClass}>Nr. Crt.</th>
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
                    {filteredClients.map((client, clientIndex) => (
                        <tr key={client.Cont} className="border-b">
                            <td className={tdClass}>{clientIndex + 1}</td>
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
                <Button
                    variant="purple"
                    onClick={sendAndExport}
                    disabled={!filter || !filteredClients.length}
                    loading={loading === "sendAndExport"}
                >
                    Trimite
                </Button>
                <Button variant="green" onClick={() => exportExcel(DBClients, "CLIENTI.xlsx")}>
                    Exportă clienți bază
                </Button>
                <Button
                    variant="green"
                    onClick={() => exportExcel(combineClients(excelClients, DBClients), "CLIENTI.xlsx")}
                >
                    Exportă clienți excel + bază
                </Button>
            </div>
        </div>
    );
};

export default ViewClients;
