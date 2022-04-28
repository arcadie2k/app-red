import React from "react";

const Toggle = ({ checked = false, setChecked = () => null, label = "" }) => {
    return (
        <label class="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" class="sr-only peer" checked={checked} onChange={() => setChecked(!checked)} />
            <div class="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600" />
            <span class="ml-3 text-sm font-medium text-gray-900">{label}</span>
        </label>
    );
};

export default Toggle;
