import React, { useState, useEffect } from "react";
import Dropdown from "../components/Dropdown";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from 'yup';
import { storage } from "../firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import axios from "axios";
import { Link } from "react-router-dom";
const AddProductType = () => {
    const [stateCity, setStateCity] = useState([]);
    const [stateList, setStateList] = useState([]);
    const [cityList, setCityList] = useState([]);
    const [selectedState, setSelectedState] = useState(null);
    const [success, setSuccess] = useState(false);
    const [failure, setFailure] = useState(false);
    const [loading, setLoading] = useState(false);
    const [image, setImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);

    const SERVER = import.meta.env.VITE_SERVER_URL;

    const validationSchema = Yup.object({
        name: Yup.string()
            .min(3, 'Name must be at least 3 characters')
            .required('Product name is required'),
        description: Yup.string()
            .required('Description is required'),
        category: Yup.string()
            .required('Category is required'),
        state: Yup.string()
            .required('State is required'),
        city: Yup.string()
            .required('City is required'),
        history: Yup.string()
            .required('Story is required')
    });

    const initialValues = {
        name: '',
        description: '',
        category: '',
        state: '',
        city: '',
        history: ''
    };

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

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const uploadImageToFirebase = async (file) => {
        const storageRef = ref(storage, `product_types/${file.name}`);
        await uploadBytes(storageRef, file);
        return await getDownloadURL(storageRef);
    };

    const handleSubmit = async (values, { resetForm }) => {
        setSuccess(false);
        setLoading(true);

        try {
            let imageUrl = "";
            if (image) {
                imageUrl = await uploadImageToFirebase(image);
            }

            const finalData = {
                ...values,
                image: imageUrl,
            };
            console.log(finalData);
            const response = await axios.post(
                `${SERVER}/product-types/add-product-type`,
                finalData
            );

            console.log("API Response: ", response.data);
            setSuccess(true);
            setTimeout(() => {
                setSuccess(false);
            }, 3000);
            window.scrollTo(0, 0);
            resetForm();
            setImage(null);
            setImagePreview(null);
        } catch (error) {
            setFailure(true);
            console.error("Error: ", error.message);
        }
        setLoading(false);
    };

    return (
        <>
            {success && (
                <div id="success" className="fixed w-full flex justify-center z-50 py-[100px]">
                    <h1 className="bg-hippie-green-300 px-5 py-2 rounded-lg border border-hippie-green-800 text-hippie-green-900 drop-shadow-2xl">
                        Product added successfully
                    </h1>
                </div>
            )}

            <div className="w-full min-h-screen flex flex-col gap-10 items-center">
                <div className="w-full flex items-center justify-between px-10 py-2 bg-hippie-green-400 shadow-lg relative">
                <Link to="/home"><img src={"/logoName.png"} className="h-10" alt="" /></Link>
                </div>

                <div className="xl:w-1/2 lg:w-1/2 md:w-8/12 w-11/12 flex items-center justify-center my-10">
                    <div className="w-full flex flex-col items-start gap-10 bg-hippie-green-100 drop-shadow-xl rounded-lg border p-10">
                        <h1 className="text-3xl font-semibold text-hippie-green-700">
                            Add Product Type
                        </h1>

                        <Formik
                            initialValues={initialValues}
                            validationSchema={validationSchema}
                            onSubmit={handleSubmit}
                        >
                            {({ setFieldValue }) => (
                                <Form className="w-full flex flex-col items-end gap-5">
                                    {/* Product Name */}
                                    <div className="w-full flex flex-col items-start gap-2">
                                        <label htmlFor="name" className="text-md font-medium text-gray-700">Product Name</label>
                                        <Field
                                            type="text"
                                            id="name"
                                            name="name"
                                            className="w-full px-3 py-2 border border-hippie-green-300 bg-hippie-green-50 rounded-lg focus:outline-none"
                                        />
                                        <ErrorMessage name="name" component="p" className="text-sm font-medium text-red-500" />
                                    </div>

                                    {/* Description */}
                                    <div className="w-full flex flex-col items-start gap-2">
                                        <label htmlFor="description" className="text-md font-medium text-gray-700">Description</label>
                                        <Field
                                            as="textarea"
                                            rows={2}
                                            id="description"
                                            name="description"
                                            className="w-full px-3 py-2 border border-hippie-green-300 bg-hippie-green-50 rounded-lg focus:outline-none resize-none"
                                        />
                                        <ErrorMessage name="description" component="p" className="text-sm font-medium text-red-500" />
                                    </div>

                                    {/* Image Upload */}
                                    <div className="w-full flex flex-col items-start gap-2">
                                        <label htmlFor="image" className="text-md font-medium text-gray-700">Image</label>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageChange}
                                            className="border p-2 rounded"
                                        />
                                        {imagePreview && (
                                            <img src={imagePreview} alt="Preview" className="w-full max-h-60 object-cover mt-2" />
                                        )}
                                    </div>

                                    {/* Category */}
                                    <div className="w-full flex flex-col items-start gap-2">
                                        <label className="text-md font-medium text-gray-700">Category</label>
                                        <Dropdown
                                            options={["Clothing", "Accessories",  "Foods", "HandiCrafts"]}
                                            selected={initialValues.category}
                                            onSelect={(value) => setFieldValue("category", value)}
                                        />
                                        <ErrorMessage name="category" component="p" className="text-sm font-medium text-red-500" />
                                    </div>

                                    {/* State */}
                                    <div className="w-full flex flex-col items-start gap-2">
                                        <label className="text-md font-medium text-gray-700">State</label>
                                        <Dropdown
                                            options={stateList}
                                            selected={initialValues.state}
                                            onSelect={(value) => {
                                                setSelectedState(value);
                                                setFieldValue("state", value);
                                            }}
                                        />
                                        <ErrorMessage name="state" component="p" className="text-sm font-medium text-red-500" />
                                    </div>

                                    {/* City */}
                                    <div className="w-full flex flex-col items-start gap-2">
                                        <label className="text-md font-medium text-gray-700">City</label>
                                        <Dropdown
                                            options={cityList}
                                            selected={initialValues.city}
                                            onSelect={(value) => setFieldValue("city", value)}
                                        />
                                        <ErrorMessage name="city" component="p" className="text-sm font-medium text-red-500" />
                                    </div>

                                    {/* Story */}
                                    <div className="w-full flex flex-col items-start gap-2">
                                        <label htmlFor="history" className="text-md font-medium text-gray-700">Story Telling</label>
                                        <Field
                                            as="textarea"
                                            rows={10}
                                            id="history"
                                            name="history"
                                            className="w-full px-3 py-2 border border-hippie-green-300 bg-hippie-green-50 rounded-lg focus:outline-none resize-none"
                                        />
                                        <ErrorMessage name="history" component="p" className="text-sm font-medium text-red-500" />
                                    </div>

                                    {failure && (
                                        <p className="w-full text-center font-medium text-md text-red-500">
                                            An error occurred, Try again!
                                        </p>
                                    )}

                                    <button
                                        type="submit"
                                        className="bg-hippie-green-600 text-white py-3 px-10 rounded-lg text-md font-semibold mt-5"
                                        disabled={loading}
                                    >
                                        {loading ? 'Submitting...' : 'Submit'}
                                    </button>
                                </Form>
                            )}
                        </Formik>
                    </div>
                </div>
            </div>
        </>
    );
};

export default AddProductType;
