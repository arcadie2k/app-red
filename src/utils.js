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

export const combineClients = (excelClients, DBClients) => {
    const combinedClients = excelClients.map((excelClient) => {
        let newExcelClient = { ...excelClient };

        const clientIndex = DBClients.findIndex((DBClient) => String(DBClient.Cont) === String(excelClient.Cont));

        if (clientIndex > -1) {
            newExcelClient = {
                ...newExcelClient,
                ...DBClients[clientIndex],
                fromDB: true,
            };
        }

        return newExcelClient;
    });

    return combinedClients;
};

export const getClient = async (Cont) => {
    let client = null;

    try {
        const res = await axios.get("/client", {
            params: {
                Cont,
            },
        });

        client = res.data;
    } catch (err) {
        console.error(err);
    }

    return client;
};

export const formatDate = (milis) => {
    const actualDate = new Date(Number(milis));

    let D = actualDate.getDate();
    let M = actualDate.getMonth() + 1;
    if (M < 10) M = "0" + M;
    let Y = actualDate.getFullYear();

    return `${D}.${M}.${Y}`;
};
