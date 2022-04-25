import React, { useContext, useCallback } from "react";
import * as XLSX from "xlsx";
import { getClients } from "../utils";
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
            setExcelClients(clientsFromExcel);
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
                <div className="mt-1 text-sm text-gray-500 dark:text-gray-300">Upload Byt.xlsx</div>
            </div>
        </div>
    );
};

export default Load;
