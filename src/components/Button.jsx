import React from "react";

const buttonClassNames = {
    default:
        "text-white bg-blue-700 hover:bg-blue-800 focus:outline-none border border-transparent focus:ring-4 focus:ring-blue-300 ",
    alternative:
        "text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-200",
    dark: "text-white bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-4 focus:ring-gray-300",
    light: "text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-200",
    green: "text-white bg-green-700 hover:bg-green-800 focus:outline-none focus:ring-4 focus:ring-green-300 ",
    red: "text-white bg-red-700 hover:bg-red-800 focus:outline-none focus:ring-4 focus:ring-red-300 ",
    yellow: "text-white bg-yellow-400 hover:bg-yellow-500 focus:outline-none focus:ring-4 focus:ring-yellow-300",
    purple: "text-white bg-purple-700 hover:bg-purple-800 focus:outline-none focus:ring-4 focus:ring-purple-300",
};

const Button = ({
    submit = false,
    type = "default",
    onClick = () => null,
    children = "Button",
    disabled = false,
    className = "",
}) => {
    return (
        <div
            className={`${
                disabled ? "opacity-50 pointer-events-none" : "opacity-100 pointer-events-auto"
            } ${className}`}
        >
            <button
                type={submit ? "submit" : "button"}
                className={`font-medium rounded-lg text-sm px-5 py-2.5 text-center ${buttonClassNames[type]}`}
                onClick={onClick}
            >
                {children}
            </button>
        </div>
    );
};

export default Button;
