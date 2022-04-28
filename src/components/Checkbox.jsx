import React, { useState } from "react";

const Checkbox = ({ checked, setChecked, label }) => {
    const [ID] = useState(() => {
        let random = String(Math.random());
        random = random.split(".")[1];
        return random;
    });

    return (
        <div class="flex items-start">
            <div class="flex items-center cursor-pointer mr-3">
                <input
                    id={ID}
                    type="checkbox"
                    className="w-4 h-4 bg-gray-50 rounded border border-gray-300 focus:ring-3 focus:ring-blue-300 cursor-pointer"
                    checked={checked}
                    onChange={() => setChecked(!checked)}
                />
            </div>

            <label htmlFor={ID} class="text-sm font-medium text-gray-900 cursor-pointer">
                {label}
            </label>
        </div>
    );
};

export default Checkbox;
