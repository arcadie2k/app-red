import React from "react";

const Input = ({ label = "", value, onChange = () => null }) => {
    return (
        <div className="relative">
            {!!label.length && <label className="block mb-2 pl-2 text-sm font-medium text-gray-900">{label}</label>}
            <input
                type="text"
                className="mx-auto bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                value={value}
                onChange={onChange}
                autoComplete="off"
            />
        </div>
    );
};

export default Input;
