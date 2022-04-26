import axios from "axios";

export const getClients = async () => {
    let clients = [];
    try {
        const res = await axios.get("/clients");
        clients = res.data;
    } catch (err) {
        console.error(err);
    }

    return clients;
};

export const formatDate = (milis) => {
    const actualDate = new Date(Number(milis));

    let D = actualDate.getDate();
    let M = actualDate.getMonth() + 1;
    if (M < 10) M = "0" + M;
    let Y = actualDate.getFullYear();

    return `${D}.${M}.${Y}`;
};

export const combineClients = (excelClients, DBClients) => {
    /**
     * Overwrite Excel clients with those from DB
     */
    const combinedClients = [...excelClients];

    combinedClients.forEach((excelClient, excelClientIndex) => {
        let newExcelClient = { ...excelClient };

        newExcelClient.sentAt = null;
        newExcelClient.fromDB = false;

        delete newExcelClient.Adresa_E;
        delete newExcelClient.Pow;
        delete newExcelClient.Tip;
        delete newExcelClient.NrContor;
        delete newExcelClient.TipContor;
        delete newExcelClient.Data;
        delete newExcelClient.Faze;

        const clientIndex = DBClients.findIndex((dbClient) => String(dbClient.Cont) === String(excelClient.Cont));

        if (clientIndex > -1) {
            newExcelClient = {
                ...newExcelClient,
                ...DBClients[clientIndex],
                fromDB: true,
            };
        } else {
            /**
             * Format phone numbers
             */
            newExcelClient.Fix1 = "";
            newExcelClient.Mobil1 = "";
            newExcelClient.Fix2 = "";
            newExcelClient.Mobil2 = "";

            newExcelClient.Telefon_1 = "Telefon_1" in newExcelClient ? String(newExcelClient.Telefon_1) : "";
            newExcelClient.Telefon_2 = "Telefon_2" in newExcelClient ? String(newExcelClient.Telefon_2) : "";

            if (newExcelClient.Telefon_1?.length) {
                const spl = newExcelClient.Telefon_1.split("m:");

                newExcelClient.Fix1 = spl[0].trim();
                if (spl.length > 1) newExcelClient.Mobil1 = spl[1].trim();
            }

            if (newExcelClient.Telefon_2?.length) {
                const spl = newExcelClient.Telefon_2.split("m:");

                newExcelClient.Fix2 = spl[0].trim();
                if (spl.length > 1) newExcelClient.Mobil2 = spl[1].trim();
            }
        }
        combinedClients[excelClientIndex] = newExcelClient;
    });

    return combinedClients;
};
