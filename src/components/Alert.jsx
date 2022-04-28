import React from "react";

const Alert = ({ message = "", variant = "success" }) => {
    return (
        <div class="p-4 text-sm text-green-700 border border-green-200 bg-green-100 rounded-lg" role="alert">
            <span class="font-medium">{message}</span>
        </div>
    );
};

export default Alert;
