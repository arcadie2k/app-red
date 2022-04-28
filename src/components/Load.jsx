import React, { useContext, useCallback } from "react";
import * as XLSX from "xlsx";
import ExcelClients from "../contexts/ExcelClients";

const Load = () => {
    const { setExcelClients } = useContext(ExcelClients);

    const uploadFile = useCallback(async (e) => {
        const file = e.target.files[0];
        const reader = new FileReader();

        reader.onload = (event) => {
            const binaryString = event.target.result;
            const workbook = XLSX.read(binaryString, { type: "binary" });
            const worksheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[worksheetName];
            const clientsFromExcel = XLSX.utils.sheet_to_json(worksheet);

            const excelClients = clientsFromExcel.map((client) => {
                const newClient = { ...client };
                newClient.sentAt = null;
                newClient.fromDB = false;

                newClient.Telefon_1 = "Telefon_1" in newClient ? String(newClient.Telefon_1) : "";
                newClient.Telefon_2 = "Telefon_2" in newClient ? String(newClient.Telefon_2) : "";

                newClient.Fix1 = "";
                newClient.Mobil1 = "";
                newClient.Fix2 = "";
                newClient.Mobil2 = "";

                if (newClient.Telefon_1.length > 0) {
                    const spl = newClient.Telefon_1.split("m:");

                    newClient.Fix1 = spl[0].trim();
                    if (spl.length > 1) newClient.Mobil1 = spl[1].trim();
                }

                if (newClient.Telefon_2.length > 0) {
                    const spl = newClient.Telefon_2.split("m:");

                    newClient.Fix2 = spl[0].trim();
                    if (spl.length > 1) newClient.Mobil2 = spl[1].trim();
                }

                delete newClient.Telefon_1;
                delete newClient.Telefon_2;
                delete newClient.Adresa_E;
                delete newClient.Pow;
                delete newClient.Tip;
                delete newClient.NrContor;
                delete newClient.TipContor;
                delete newClient.Data;
                delete newClient.Faze;

                return newClient;
            });
            setExcelClients(excelClients);
        };

        reader.readAsBinaryString(file);
    }, []);

    return (
        <div className="w-full h-screen flex items-center justify-center p-8 bg-gray-200 text-center">
            <div>
                <label className="block text-sm font-medium text-gray-900">Upload file</label>
                <input
                    className="block w-64 my-2 mx-auto text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 cursor-pointer focus:outline-none focus:border-transparent"
                    type="file"
                    onChange={uploadFile}
                />
                <div className="mt-1 text-sm text-gray-500">Încarcă Byt.xlsx</div>
            </div>
        </div>
    );
};

export default Load;
