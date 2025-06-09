import React, { useState, useRef, useEffect } from "react";
import { FaChevronDown, FaChevronUp } from "react-icons/fa6";

const Dropdown = ({ options, onSelect, selected }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedValue, setSelectedValue] = useState(selected || null);
    const dropdownRef = useRef(null);

    useEffect(() => {
        // Ensure the state is updated when selected value changes from the parent
        setSelectedValue(selected);
    }, [selected]);

    const handleSelect = (option) => {
        setIsOpen(false);
        const value = typeof option === "object" ? option.id : option;
        setSelectedValue(value);
        onSelect(value);
        setSearchTerm("");
    };

    const filteredOptions = options.filter((option) => {
        const name = typeof option === "object" ? option.name : option;
        return name?.toLowerCase().includes(searchTerm.toLowerCase());
    });

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    return (
        <div className="relative w-full" ref={dropdownRef}>
            <div
                className="flex justify-between items-center border border-hippie-green-400 rounded-lg py-2 px-3 cursor-pointer bg-hippie-green-50"
                onClick={() => setIsOpen(!isOpen)}
            >
                <span>
                    {selectedValue
                        ? options.find((opt) => (typeof opt === "object" ? opt.id === selectedValue : opt === selectedValue))?.name || selectedValue
                        : "Select an option"}
                </span>
                {!isOpen ? <FaChevronDown /> : <FaChevronUp />}
            </div>
            {isOpen && (
                <div className="absolute left-0 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-10">
                    <input
                        type="text"
                        className="w-full p-2 border-b border-gray-200 focus:outline-none"
                        placeholder="Search..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <ul className="max-h-80 overflow-y-auto">
                        {filteredOptions.length > 0 ? (
                            filteredOptions.map((option, index) => (
                                <li
                                    key={index}
                                    className="p-2 hover:bg-gray-100 cursor-pointer"
                                    onClick={() => handleSelect(option)}
                                >
                                    {typeof option === "object" ? option.name : option}
                                </li>
                            ))
                        ) : (
                            <li className="p-2 text-gray-500">No results found</li>
                        )}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default Dropdown;
