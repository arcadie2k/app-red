import React, { useState, useContext, useCallback, useEffect, useMemo } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import ExcelClients from "../contexts/ExcelClients";
import { jsPDF } from "jspdf";
import Button from "./Button";
import Input from "./Input";
import Toggle from "./Toggle.jsx";
import { combineClients, formatDate, getClients } from "../utils";

const SearchClient = () => {
    const clientFields = useMemo(
        () => ({
            Cont: "",
            Consumator: "",
            Adresa: "",
            Email: "",
            Fix1: "",
            Fix2: "",
            Mobil1: "",
            Mobil2: "",
            sentAt: null,
            fromDB: false,
        }),
        []
    );

    const { excelClients } = useContext(ExcelClients);
    const [changeMade, setChangeMade] = useState(false);
    const [search, setSearch] = useState("");
    const [selectedClientValues, setSelectedClientValues] = useState({ ...clientFields });
    const [modifyName, setModifyName] = useState(false);
    const [initialName, setInitialName] = useState("");
    const [loading, setLoading] = useState(null);

    /**
     * Add client function [Done]
     */
    const addClient = useCallback(async () => {
        if (loading) return;

        try {
            setLoading("addClient");

            const res = await axios.post("/client", selectedClientValues);

            const newClientValues = {
                ...selectedClientValues,
                ...res.data,
                fromDB: true,
            };

            setSelectedClientValues(newClientValues);
            setChangeMade(false);

            toast.success(`Clientul a fost adăugat în bază!`);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(null);
        }
    }, [selectedClientValues, loading]);

    /**
     * Update client function [Done]
     */
    const updateClient = useCallback(async () => {
        if (loading) return;
        try {
            setLoading("updateClient");

            const res = await axios.put("/client", selectedClientValues);

            const newClientValues = {
                ...selectedClientValues,
                ...res.data,
            };

            setSelectedClientValues(newClientValues);
            setInitialName(newClientValues.Consumator);
            setChangeMade(false);
            setModifyName(false);

            toast.success(`Clientul a fost modificat!`);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(null);
        }
    }, [selectedClientValues, loading]);

    /**
     * Search by Cont [Done]
     */
    const checkClient = useCallback(async () => {
        if (loading) return;

        setSelectedClientValues(clientFields);
        setInitialName("");
        setChangeMade(false);
        setModifyName(false);

        if (!search.length) return;

        setLoading("checkClient");

        const DBClients = await getClients();
        const clients = combineClients(excelClients, DBClients);
        const clientIndex = clients.findIndex((client) => String(client.Cont) === search);

        if (clientIndex > -1) {
            const newClientValues = {};

            for (const clientKey in clientFields) {
                newClientValues[clientKey] = clients[clientIndex][clientKey] || "";
            }

            setSelectedClientValues(newClientValues);
            setInitialName(newClientValues.Consumator);
        }

        setLoading(null);
    }, [excelClients, clientFields, search, loading]);

    /**
     * Unsend client function [Done]
     */
    const unsendClient = useCallback(async () => {
        if (loading) return;

        try {
            setLoading("unsendClient");

            await axios.put("/unsendClient", {
                Cont: selectedClientValues.Cont,
            });

            const newClientValues = {
                ...selectedClientValues,
                sentAt: null,
            };

            setSelectedClientValues(newClientValues);
            toast.success(`Trimiterea clientului a fost anulată!`);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(null);
        }
    }, [selectedClientValues, loading]);

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
                text: `Anexa la contractul nr. ${selectedClientValues.Cont}`,
                h: 50,
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
        doc.text(`Data: ${formatDate(new Date())}`, 20, getHeight(45));

        doc.text("Consumator", 120, getHeight(32));
        doc.text(selectedClientValues.Consumator, 120, getHeight(34));
        doc.text("___________________________", 120, getHeight(34));
        doc.text("___________________________", 120, getHeight(36));

        doc.text("________________________________________________________________________", 20, getHeight(6));

        doc.output("dataurlnewwindow", `${selectedClientValues.Consumator}.pdf`);
    }, [selectedClientValues]);

    useEffect(() => {
        if (modifyName === false && selectedClientValues.Consumator !== initialName) {
            setSelectedClientValues({
                ...selectedClientValues,
                Consumator: initialName,
            });

            setChangeMade(true);
        }
    }, [modifyName, initialName, selectedClientValues]);

    return (
        <section>
            {/* Search by Cont */}
            <div className="w-full pt-6 pb-8">
                <div className="mx-auto max-w-md">
                    <form
                        className="flex items-end justify-center space-x-2"
                        onSubmit={(e) => {
                            e.preventDefault();
                            checkClient();
                        }}
                    >
                        <Input value={search} onChange={(e) => setSearch(e.target.value)} label="Cont Client" />
                        <Button type="submit" onClick={checkClient} loading={loading === "checkClient"}>
                            Caută
                        </Button>
                    </form>
                </div>
            </div>

            {/* Client Information */}
            {selectedClientValues.Cont !== "" && (
                <div>
                    <div
                        className={`p-8 transition-colors border-t border-b ${
                            selectedClientValues.fromDB ? "bg-green-200" : "bg-slate-200"
                        }`}
                    >
                        <h1 className="text-3xl font-medium">
                            Informații despre client<span className="text-red-900">{changeMade ? "*" : ""}</span>
                        </h1>
                        <p className="mb-4 text-xs italic text-slate-500">
                            Sursă: {selectedClientValues.fromDB ? "bază" : "excel"}
                        </p>

                        {/* Static fields */}
                        <div className="w-full grid grid-cols-3 gap-4 mb-4">
                            {["Cont", "Consumator", "Adresa"].map((clientKey) => (
                                <Input
                                    key={clientKey}
                                    label={clientKey}
                                    value={selectedClientValues[clientKey]}
                                    onChange={
                                        clientKey === "Consumator" && modifyName
                                            ? (e) => {
                                                  setChangeMade(true);
                                                  setSelectedClientValues({
                                                      ...selectedClientValues,
                                                      [clientKey]: e.target.value,
                                                  });
                                              }
                                            : null
                                    }
                                />
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
                    </div>

                    {/* Buttons */}
                    <div className="w-full flex items-center justify-between p-8 space-x-2">
                        <div className="flex items-center space-x-2">
                            {selectedClientValues.fromDB ? (
                                <Button
                                    variant="green"
                                    onClick={updateClient}
                                    disabled={!changeMade}
                                    loading={loading === "updateClient"}
                                >
                                    Salvează schimbări
                                </Button>
                            ) : (
                                <Button variant="green" onClick={addClient} loading={loading === "addClient"}>
                                    Adaugă în bază
                                </Button>
                            )}

                            <Button variant="purple" onClick={generatePDF} disabled={changeMade}>
                                Printează
                            </Button>

                            {/* Predohraniteli dlia imeni */}
                            <div className="flex items-center pl-8">
                                <Toggle
                                    checked={modifyName}
                                    setChecked={setModifyName}
                                    label="Vreau să modific numele"
                                />
                            </div>
                        </div>

                        {/* Unsend button */}
                        {!!selectedClientValues.sentAt && (
                            <Button variant="red" onClick={unsendClient} loading={loading === "unsendClient"}>
                                Anulează trimitere
                            </Button>
                        )}
                    </div>
                </div>
            )}
        </section>
    );
};

export default SearchClient;
