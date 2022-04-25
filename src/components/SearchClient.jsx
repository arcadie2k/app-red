import React, { useState, useContext, useCallback } from "react";
import axios from "axios";
import { jsPDF } from "jspdf";
import Button from "./Button";
import Input from "./Input";
import { combineClients, getClients } from "../utils";
import ExcelClients from "../contexts/ExcelClients";

const SearchClient = ({ clients, setClients }) => {
    const clientFields = {
        Cont: "",
        Consumator: "",
        Adresa: "",
        Email: "",
        Fix1: "",
        Fix2: "",
        Mobil1: "",
        Mobil2: "",
        Telefon2: "",
        fromDB: false,
        sentAt: null,
    };

    const [changeMade, setChangeMade] = useState(false);
    const [search, setSearch] = useState("");
    const [selectedClientValues, setSelectedClientValues] = useState({ ...clientFields });
    const { excelClients } = useContext(ExcelClients);

    /**
     * Add client function [Optimized]
     */
    const addClient = useCallback(async () => {
        try {
            const res = await axios.post("/client", selectedClientValues);

            const newClientValues = {
                ...selectedClientValues,
                ...res.data,
                fromDB: true,
            };

            setSelectedClientValues(newClientValues);
            setChangeMade(false);
        } catch (err) {
            console.error(err);
        }
    }, [selectedClientValues]);

    /**
     * Update client function [Optimized]
     */
    const updateClient = useCallback(async () => {
        try {
            const res = await axios.put("/client", selectedClientValues);

            const newClientValues = {
                ...selectedClientValues,
                ...res.data,
            };

            setSelectedClientValues(newClientValues);
            setChangeMade(false);
        } catch (err) {
            console.error(err);
        }
    }, [selectedClientValues]);

    /**
     * Search by Cont [Optimized]
     */
    const checkClient = useCallback(async () => {
        setChangeMade(false);
        if (!search.length) return;

        const DBClients = await getClients();
        const clients = combineClients(excelClients, DBClients);
        const clientIndex = clients.findIndex((client) => String(client.Cont) === search);
        if (clientIndex > -1) {
            const newClientValues = {};

            for (const clientKey in clientFields) {
                newClientValues[clientKey] = clients[clientIndex][clientKey] || "";
            }

            setSelectedClientValues(newClientValues);
        } else {
            setSelectedClientValues(clientFields);
        }
    }, [search, excelClients, clientFields]);

    /**
     * Unsend client function [Optimized]
     */
    const unsendClient = useCallback(async () => {
        try {
            await axios.put("/unsendClient", {
                Cont: selectedClientValues.Cont,
            });

            const newClientValues = {
                ...selectedClientValues,
                sentAt: null,
            };

            setSelectedClientValues(newClientValues);
        } catch (err) {
            console.error(err);
        }
    }, [selectedClientValues]);

    /**
     * Generate PDF
     */
    const generatePDF = useCallback(() => {
        var doc = new jsPDF();
        var marginTop = 15;
        var rowHeight = 5;

        const getHeight = (row) => {
            return marginTop + row * rowHeight;
        };

        const content = [
            {
                fontSize: 22,
                text: "Anexa la contractul nr. 123123",
                h: 55,
            },
            { text: "" },
            { text: "" },
            {
                fontSize: 14,
                text: "de furnizare a energiei electrice consumatorului casnic",
                h: 45,
            },
            { text: "" },
            {
                fontSize: 12,
                text: selectedClientValues.Consumator,
            },
            { text: "" },
            {
                text: "Prin prezenta, confirm ca datele de contact sunt urmatoarele",
            },
            { text: "" },
            { text: "" },
            {
                text: "Adresa: " + selectedClientValues.Adresa,
            },
            { text: "" },
            {
                text: "Telefon de contact: ",
            },
            {
                text: "Fix: " + selectedClientValues.Fix1 + " / " + selectedClientValues.Fix2,
            },
            {
                text: "Mobil: " + selectedClientValues.Mobil1 + " / " + selectedClientValues.Mobil2,
            },
            { text: "" },
            {
                text: "Adresa de email: " + selectedClientValues.Email,
            },
            { text: "" },
            { text: "" },
            {
                text: "Plata energiei electrice consumate se efectueaza in baza facturii, emisa lunar de catre furnizor, si",
            },
            {
                text: "inmanata consumatorului final sau expediata prin posta sau, in cazul acordului consumatorului final,",
            },
            {
                text: "prin posta electronica.",
            },
            { text: "" },
            {
                text: "Solicit factura sa-mi fie expediata pe posta electronica indicata.",
            },
            { text: "" },
            {
                text: "Furnizorul nu este responsabil de monitorizarea schimbarii datelor de contact si adresei postale a",
            },
            {
                text: "consumatorului. Prin urmare, in cazul modificarii informatiei prezentate mai sus, consumatorul isi",
            },
            {
                text: "asuma obligatia sa informeze furnizorul despre respectivele modificari.",
            },
        ];

        content.forEach((line, lineIndex) => {
            if (line.fontSize) doc.setFontSize(line.fontSize);
            doc.text(line.text, line.h || 20, getHeight(lineIndex + 1));
        });

        /**
         * Footer
         */
        doc.text("Furnizor", 20, getHeight(32));
        doc.text("Manager vanzari", 20, getHeight(34));
        doc.text("Caldare Oleg ______________", 20, getHeight(36));

        doc.text("Consumator", 120, getHeight(32));
        doc.text(selectedClientValues.Consumator, 120, getHeight(34));
        doc.text("___________________________", 120, getHeight(34));
        doc.text("___________________________", 120, getHeight(36));

        doc.text("________________________________________________________________________", 20, getHeight(6));

        doc.save(`${selectedClientValues.Consumator}.pdf`);
    }, [selectedClientValues]);

    return (
        <div>
            <div className="w-full pt-8 pb-10 rounded-md">
                <div className="mx-auto max-w-md">
                    <form
                        className="flex items-end space-x-2"
                        onSubmit={(e) => {
                            e.preventDefault();
                            checkClient();
                        }}
                    >
                        <Input value={search} onChange={(e) => setSearch(e.target.value)} label="Cont Client" />
                        <Button submit onClick={checkClient}>
                            Cauta
                        </Button>
                    </form>
                </div>
            </div>

            {selectedClientValues.Cont !== "" && (
                <div
                    className={`p-8 transition-colors border-t ${
                        selectedClientValues.fromDB ? "bg-green-200" : "bg-slate-200"
                    }`}
                >
                    <h1 className="text-3xl font-medium">
                        Informatii despre client<span className="text-red-900">{changeMade ? "*" : ""}</span>
                    </h1>
                    <p className="mb-4 text-xs italic text-slate-500">
                        Sursa: {selectedClientValues.fromDB ? "baza de date" : "excel"}
                    </p>

                    {/* Static fields */}
                    <div className="w-full grid grid-cols-3 gap-4 mb-4">
                        {["Cont", "Consumator", "Adresa"].map((clientKey) => (
                            <Input key={clientKey} label={clientKey} value={selectedClientValues[clientKey]} />
                        ))}
                    </div>

                    {/* Dynamic fields */}
                    <div className="w-full grid grid-cols-4 gap-4 mb-4">
                        {["Fix1", "Mobil1", "Fix2", "Mobil2"].map((clientKey) => (
                            <Input
                                key={clientKey}
                                label={clientKey}
                                value={selectedClientValues[clientKey]}
                                onChange={(e) => {
                                    setChangeMade(true);
                                    setSelectedClientValues({
                                        ...selectedClientValues,
                                        [clientKey]: e.target.value,
                                    });
                                }}
                            />
                        ))}
                    </div>

                    <div className="mb-8">
                        <Input
                            label="Email"
                            value={selectedClientValues["Email"]}
                            onChange={(e) => {
                                setChangeMade(true);
                                setSelectedClientValues({
                                    ...selectedClientValues,
                                    Email: e.target.value,
                                });
                            }}
                        />
                    </div>

                    {/* Buttons */}
                    <div className="w-full flex items-center justify-between space-x-2">
                        <div className="flex space-x-2">
                            {selectedClientValues.fromDB ? (
                                <Button type="green" onClick={updateClient} disabled={!changeMade}>
                                    Save changes
                                </Button>
                            ) : (
                                <Button type="green" onClick={addClient}>
                                    Create entry
                                </Button>
                            )}

                            <Button type="purple" onClick={generatePDF} disabled={changeMade}>
                                Print
                            </Button>
                        </div>

                        {/* Unsend button */}
                        {!!selectedClientValues.sentAt && (
                            <Button type="red" onClick={unsendClient}>
                                Amana trimitere
                            </Button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default SearchClient;
