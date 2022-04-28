import React, { createContext, useState, useEffect, useCallback } from "react";
import Alert from "../components/Alert";

export const AlertsContext = createContext([]);
const Alerts = ({ children }) => {
    const [alerts, setAlerts] = useState([]);

    const makeAlert = useCallback(
        (message = "", variant = "success") => {
            if (!message.length) return;

            setAlerts([{ createdAt: Date.now(), message, variant }, ...alerts]);
        },
        [alerts]
    );

    useEffect(() => {
        let newAlerts = [...alerts];

        const interval = setInterval(() => {
            const now = Date.now();
            newAlerts = newAlerts.filter((alert) => now - alert.createdAt < 3000);
            setAlerts(newAlerts);
        }, 250);

        return () => clearInterval(interval);
    }, [alerts]);

    return (
        <AlertsContext.Provider value={{ alerts, setAlerts, makeAlert }}>
            <div>
                <div className="relative z-10">{children}</div>
                <div className="fixed bottom-8 right-8 z-50">
                    <div className="flex flex-col items-end space-y-2">
                        {alerts.map((alert) => (
                            <Alert key={alert.createdAt} message={alert.message} variant={alert.variant} />
                        ))}
                    </div>
                </div>
            </div>
        </AlertsContext.Provider>
    );
};

export default Alerts;
