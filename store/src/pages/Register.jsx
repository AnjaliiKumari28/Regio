import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Dropdown from "../components/Dropdown";
import { useFormik } from "formik";
import * as Yup from "yup";
import { auth } from "../firebase";
import axios from "axios";

const FormField = ({ field, formik, labelOverride, error }) => {
    return (
        <div className="w-full flex flex-col items-start gap-2">
            <label htmlFor={field} className="text-md font-medium text-gray-700">
                {labelOverride || (field === "cnfpass" ? "Confirm Password" : field.charAt(0).toUpperCase() + field.slice(1))}
            </label>
            <input
                type={field.includes("pass") ? "password" : "text"}
                id={field}
                name={field}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values[field]}
                className={`w-full px-3 py-2 border ${error ? 'border-red-500' : 'border-hippie-green-300'} bg-hippie-green-50 rounded-lg focus:outline-none`}
            />
            {error && (
                <p className="text-sm font-medium text-red-500">{error}</p>
            )}
            {formik.touched[field] && formik.errors[field] && !error && (
                <p className="text-sm font-medium text-red-500">{formik.errors[field]}</p>
            )}
        </div>
    );
};

const Register = () => {
    const [stateCity, setStateCity] = useState([]);
    const [stateList, setStateList] = useState([]);
    const [cityList, setCityList] = useState([]);
    const [selectedState, setSelectedState] = useState(null);
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    const SERVER = import.meta.env.VITE_SERVER_URL;

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch("/states-and-districts.json");
                const result = await response.json();
                setStateCity(result.states);
                setStateList(result.states.map((item) => item.state));
            } catch (error) {
                console.error("Error fetching state list:", error);
            }
        };
        fetchData();
    }, []);

    useEffect(() => {
        if (selectedState) {
            const tempList = stateCity.find((item) => selectedState === item.state)?.districts;
            setCityList(tempList || []);
        }
    }, [selectedState]);

    const initialValues = {
        email: "",
        password: "",
        cnfpass: "",
        fullname: "",
        phone: "",
        store: "",
        address: "",
        pincode: "",
        state: "",
        city: "",
        aadhar: "",
        pan: "",
    };

    const validationSchema = Yup.object({
        email: Yup.string().email("Invalid email").required("Email is required"),
        password: Yup.string().min(6, "Password must be at least 6 characters").required("Password is required"),
        cnfpass: Yup.string().oneOf([Yup.ref("password")], "Passwords do not match").required("Please retype password"),
        fullname: Yup.string().min(3, "Name must be at least 3 characters").required("Fullname is required"),
        phone: Yup.string().matches(/^[6-9]\d{9}$/, "Enter a valid Indian phone number").required("Phone is required"),
        store: Yup.string().required("Store name is required"),
        address: Yup.string().required("Address is required"),
        pincode: Yup.string().matches(/^[0-9]{6}$/, "Enter a valid 6-digit pincode").required("Pincode is required"),
        state: Yup.string().required("State is required"),
        city: Yup.string().required("City is required"),
        aadhar: Yup.string().matches(/^[0-9]{12}$/, "Enter a valid 12-digit Aadhar number").required("Aadhar is required"),
        pan: Yup.string().matches(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, "Enter a valid PAN number").required("PAN is required"),
    });

    const formik = useFormik({
        initialValues,
        validationSchema,
        onSubmit: async (values, { resetForm }) => {
            if (loading) return;
            setLoading(true);
            setErrors({});

            try {
                await axios.post(`${SERVER}/seller-auth/register`, values);
                setSuccess(true);
                window.scrollTo(0, 0);
                resetForm();
            } catch (error) {
                if (error.response?.data?.error) {
                    const errorMessage = error.response.data.error;
                    if (errorMessage.includes("Email already registered")) {
                        setErrors(prev => ({ ...prev, email: errorMessage }));
                    } else if (errorMessage.includes("Phone number already used")) {
                        setErrors(prev => ({ ...prev, phone: errorMessage }));
                    } else if (errorMessage.includes("Aadhar already registered")) {
                        setErrors(prev => ({ ...prev, aadhar: errorMessage }));
                    } else if (errorMessage.includes("PAN already registered")) {
                        setErrors(prev => ({ ...prev, pan: errorMessage }));
                    } else {
                        alert("Something went wrong: " + errorMessage);
                    }
                } else {
                    alert("Something went wrong. Please try again.");
                }
            } finally {
                setLoading(false);
            }
        },
    });

    return (
        <>
            {success && (
                <div className="absolute w-full min-h-screen flex items-center justify-center backdrop-blur-sm bg-white/20 z-50">
                    <div className="xl:w-1/3 lg:w-1/2 md:w-8/12 w-11/12 p-10 bg-hippie-green-50 rounded-xl drop-shadow-xl border border-hippie-green-300 flex flex-col items-center">
                        <h1 className="text-hippie-green-600 text-3xl text-center font-bold">Registration Successful</h1>
                        <img src="/registerdone.svg" className="w-full" alt="" />
                        <p className="pb-10 text-md text-gray-700 text-center">You can now log into your account</p>
                        <Link to={"/login"} className="bg-hippie-green-600 text-white px-10 py-2 rounded-lg">Go to Log In</Link>
                    </div>
                </div>
            )}

            <div className="w-full min-h-screen flex flex-col gap-10 items-center relative py-10">
                <div className="absolute top-0 w-full flex items-center justify-between px-3 md:px-10 pt-2 pb-1 bg-hippie-green-400 shadow-lg ">
                    <img src={"/logoName.png"} className="h-10" alt="" />
                </div>

                <div className="xl:w-1/2 lg:w-1/2 md:w-8/12 w-11/12 flex items-center justify-center my-10">
                    <form onSubmit={formik.handleSubmit} className="w-full flex flex-col items-end gap-5 bg-hippie-green-100 drop-shadow-xl rounded-lg border px-5 md:px-10 py-10">
                        <h1 className="w-full text-3xl font-bold text-hippie-green-700">Register as Seller</h1>

                        {["email", "phone", "fullname", "store", "address"].map((field) => (
                            <FormField 
                                key={field} 
                                field={field} 
                                formik={formik} 
                                error={errors[field]}
                            />
                        ))}

                        {/* State Dropdown */}
                        <div className="w-full flex flex-col items-start gap-2">
                            <label className="text-md font-medium text-gray-700">Select State</label>
                            <Dropdown
                                options={stateList}
                                selected={formik.values.state}
                                onSelect={(value) => {
                                    setSelectedState(value);
                                    formik.setFieldValue("state", value);
                                }}
                            />
                            {formik.touched.state && formik.errors.state && (
                                <p className="text-sm font-medium text-red-500">{formik.errors.state}</p>
                            )}
                        </div>

                        {/* City Dropdown */}
                        <div className="w-full flex flex-col items-start gap-2">
                            <label className="text-md font-medium text-gray-700">Select City</label>
                            <Dropdown
                                options={cityList}
                                selected={formik.values.city}
                                onSelect={(value) => formik.setFieldValue("city", value)}
                            />
                            {formik.touched.city && formik.errors.city && (
                                <p className="text-sm font-medium text-red-500">{formik.errors.city}</p>
                            )}
                        </div>

                        {["pincode", "aadhar", "pan", "password", "cnfpass"].map((field) => (
                            <FormField 
                                key={field} 
                                field={field} 
                                formik={formik} 
                                error={errors[field]}
                            />
                        ))}

                        <button 
                            type="submit" 
                            className="bg-hippie-green-600 text-white py-3 px-10 rounded-lg text-md font-semibold mt-5 active:bg-hippie-green-700 transition-colors ease-in-out duration-200"
                            disabled={loading}
                        >
                            {loading ? "Submitting..." : "Submit"}
                        </button>

                        <Link to={"/login"} className="text-sm text-gray-700">Already have an account? <strong className="text-hippie-green-800">Log In</strong></Link>
                    </form>
                </div>
            </div>
        </>
    );
};

export default Register;
