import React, { useState, useContext, useEffect } from "react";
import { Formik, Form, Field, FieldArray } from "formik";
import * as Yup from "yup";
import Dropdown from "../components/Dropdown";
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from "../firebase";
import { AuthContext } from "../contexts/authContext";
import axios from "axios";
import { Link } from "react-router-dom";
import { IoClose } from "react-icons/io5";

const AddProduct = () => {
    const { seller } = useContext(AuthContext);
    const [productTypes, setProductTypes] = useState([]);
    const [productTypesData, setProductTypesData] = useState([]);
    const SERVER = import.meta.env.VITE_SERVER_URL;
    const [previewImages, setPreviewImages] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    useEffect(() => {
        fetchProductTypes();
    }, []);

    const fetchProductTypes = async () => {
        try {
            const response = await axios.get(`${SERVER}/product-types/product-names`);
            setProductTypesData(response.data);
            const names = response.data.map(type => type.name);
            setProductTypes(names);
        } catch (error) {
            console.error("Error fetching product types:", error.message);
        }
    };

    const handleProductTypeSelect = (selectedName, setFieldValue) => {
        const selectedType = productTypesData.find(type => type.name === selectedName);
        if (selectedType) {
            setFieldValue('productType', selectedType._id);
            setFieldValue('productTypeName', selectedType.name);
        }
    };

    const validationSchema = Yup.object().shape({
        productName: Yup.string().required("Product name is required"),
        description: Yup.string().required("Description is required"),
        specifications: Yup.string().required("Specifications are required"),
        productType: Yup.string().required("Product type is required"),
        productTypeName: Yup.string().required("Product type name is required"),
        productCategory: Yup.string().required("Product category is required"),
        varieties: Yup.array().of(
            Yup.object().shape({
                title: Yup.string().required("Variety title is required"),
                options: Yup.array().of(
                    Yup.object().shape({
                        label: Yup.string().required("Option label is required"),
                        price: Yup.number()
                            .required("Price is required")
                            .min(0, "Price must be greater than 0"),
                        mrp: Yup.number()
                            .required("MRP is required")
                            .min(0, "MRP must be greater than 0")
                            .test('mrp-greater-than-price', 'MRP must be greater than price', function (value) {
                                return value >= this.parent.price;
                            }),
                        quantity: Yup.number()
                            .required("Quantity is required")
                            .min(0, "Quantity must be greater than 0")
                    })
                ).min(1, "At least one option is required"),
                images: Yup.array(),
                imageFiles: Yup.array(),
            }).test('has-images', 'At least one image is required', function(value) {
                const hasImages = value.images && value.images.length > 0;
                const hasImageFiles = value.imageFiles && value.imageFiles.length > 0;
                return hasImages || hasImageFiles;
            })
        ).min(1, "At least one variety is required")
    });

    const initialValues = {
        productName: "",
        description: "",
        specifications: "",
        productType: "",
        productTypeName: "",
        productCategory: "",
        varieties: [{
            title: "",
            options: [{
                label: "",
                price: "",
                mrp: "",
                quantity: ""
            }],
            images: []
        }]
    };

    const handleImagePreview = (event, setFieldValue, index) => {
        const files = Array.from(event.target.files).slice(0, 5);
        const previewUrls = files.map(file => URL.createObjectURL(file));
        
        setPreviewImages(prev => {
            const newPreviews = [...prev];
            newPreviews[index] = previewUrls;
            return newPreviews;
        });

        // Store the files in the form values for later upload
        setFieldValue(`varieties.${index}.imageFiles`, files);
    };

    const handleImageUpload = async (files) => {
        const uploadedImages = await Promise.all(
            files.map(async (file) => {
                const storageRef = ref(storage, `products_images/${Date.now()}-${file.name}`);
                const snapshot = await uploadBytes(storageRef, file);
                return await getDownloadURL(snapshot.ref);
            })
        );
        return uploadedImages;
    };

    const onSubmit = async (values, { setSubmitting, resetForm }) => {
        setIsSubmitting(true);
        try {
            // Upload all images first
            const varietiesWithUploadedImages = await Promise.all(
                values.varieties.map(async (variety, index) => {
                    if (variety.imageFiles) {
                        const uploadedImages = await handleImageUpload(variety.imageFiles);
                        return {
                            ...variety,
                            images: uploadedImages,
                            imageFiles: undefined // Remove the files from the final data
                        };
                    }
                    return variety;
                })
            );

            const finalData = {
                ...values,
                varieties: varietiesWithUploadedImages,
                seller_id: seller.seller_id
            };
            console.log(finalData);
            await axios.post(`${SERVER}/products-seller/add-product`,
                finalData,
                {
                    headers: {
                        Authorization: `Bearer ${seller.token}`,
                    }
                });

            setShowSuccess(true);
            resetForm();
            setPreviewImages([]);
            
            // Hide success message after 3 seconds
            setTimeout(() => {
                setShowSuccess(false);
            }, 3000);
        } catch (error) {
            console.error("Error submitting product:", error);
            alert("An error occurred. Please try again!");
        } finally {
            setIsSubmitting(false);
            setSubmitting(false);
        }
    };

    return (
        <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={onSubmit}
        >
            {({ values, errors, touched, setFieldValue }) => (
                <>
                    {/* Success Popup */}
                    {showSuccess && (
                        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
                            <div className="bg-green-100 border border-green-400 text-green-700 px-6 py-3 rounded-lg shadow-lg flex items-center gap-3">
                                <span className="font-medium">Product added successfully!</span>
                                <button 
                                    onClick={() => setShowSuccess(false)}
                                    className="text-green-700 hover:text-green-800"
                                >
                                    <IoClose />
                                </button>
                            </div>
                        </div>
                    )}

                    <div className="w-full flex flex-col items-center gap-10">
                        <div className='w-full flex items-center justify-between xl:px-10 lg:px-10 md:px-8 px-2 py-2 bg-hippie-green-400 shadow-lg relative'>
                        <Link to="/home"><img src={"/logoName.png"} className="h-10" alt="" /></Link>
                        </div>

                        <div className="xl:w-1/2 lg:w-1/2 md:w-8/12 w-11/12 flex flex-col items-end gap-5 bg-hippie-green-100 rounded-xl py-10 xl:px-10 lg:px-10 md:px-8 px-5 drop-shadow-lg my-10">
                            <h1 className="w-full text-2xl font-bold text-hippie-green-800">Add Product</h1>
                            <Form className="w-full flex flex-col items-start gap-5">
                                <div className="w-full flex flex-col items-start gap-2">
                                    <label htmlFor="name" className="text-md font-semibold text-gray-700">Product Name</label>
                                    <Field
                                        id="name"
                                        name="productName"
                                        placeholder="Product Name"
                                        className="w-full px-3 py-2 bg-hippie-green-50 rounded-md focus:outline-none border border-hippie-green-300"
                                    />
                                    {errors.productName && touched.productName && (
                                        <p className="text-red-500">{errors.productName}</p>
                                    )}
                                </div>

                                <div className="w-full flex flex-col items-start gap-2">
                                    <label htmlFor="desc" className="text-md font-semibold text-gray-700">Product Description</label>
                                    <Field
                                        as="textarea"
                                        id="desc"
                                        name="description"
                                        placeholder="Enter product description"
                                        className="w-full px-3 py-2 bg-hippie-green-50 rounded-md focus:outline-none border border-hippie-green-300 resize-none"
                                        rows={2}
                                    />
                                    {errors.description && touched.description && (
                                        <p className="text-red-500">{errors.description}</p>
                                    )}
                                </div>

                                <div className="w-full flex flex-col items-start gap-2">
                                    <label htmlFor="specs" className="text-md font-semibold text-gray-700">Product Specifications</label>
                                    <Field
                                        as="textarea"
                                        id="specs"
                                        name="specifications"
                                        placeholder="Enter product specifications"
                                        className="w-full px-3 py-2 bg-hippie-green-50 rounded-md focus:outline-none border border-hippie-green-300 resize-none"
                                        rows={5}
                                    />
                                    {errors.specifications && touched.specifications && (
                                        <p className="text-red-500">{errors.specifications}</p>
                                    )}
                                </div>

                                <div className="w-full flex flex-col items-start gap-2">
                                    <label className="text-md font-semibold text-gray-700">Product Type</label>
                                    <Dropdown
                                        selected={productTypesData.find(type => type._id === values.productType)?.name || ""}
                                        onChange={(value) => handleProductTypeSelect(value, setFieldValue)}
                                        onSelect={(value) => handleProductTypeSelect(value, setFieldValue)}
                                        options={productTypes}
                                    />
                                    {errors.productType && touched.productType && (
                                        <p className="text-red-500">{errors.productType}</p>
                                    )}
                                </div>

                                <div className="w-full flex flex-col items-start gap-2">
                                    <label className="text-md font-semibold text-gray-700">Product Category</label>
                                    <Dropdown
                                        selected={values.productCategory}
                                        onChange={(value) => setFieldValue('productCategory', value)}
                                        onSelect={(value) => setFieldValue('productCategory', value)}
                                        options={["Clothing", "Accessories",  "Foods", "HandiCrafts"]}
                                    />
                                    {errors.productCategory && touched.productCategory && (
                                        <p className="text-red-500">{errors.productCategory}</p>
                                    )}
                                </div>

                                <FieldArray name="varieties">
                                    {({ push, remove }) => (
                                        <div className="w-full flex flex-col items-start gap-2">
                                            <label className="text-md font-semibold text-gray-700">Product Varieties</label>
                                            {values.varieties.map((variety, index) => (
                                                <div
                                                    key={index}
                                                    className="w-full p-5 grid grid-cols-2 bg-hippie-green-50 gap-5 border border-hippie-green-300 rounded-md"
                                                >
                                                    <div className="w-full flex flex-col items-start gap-2 col-span-2">
                                                        <label className="text-md font-semibold text-gray-700">Variety Title</label>
                                                        <Field
                                                            name={`varieties.${index}.title`}
                                                            placeholder="Enter variety title"
                                                            className="w-full px-3 py-2 bg-hippie-green-50 rounded-md focus:outline-none border border-hippie-green-300"
                                                        />
                                                        {errors.varieties?.[index]?.title && touched.varieties?.[index]?.title && (
                                                            <p className="text-red-500">{errors.varieties[index].title}</p>
                                                        )}
                                                    </div>

                                                    <div className="w-full flex flex-col items-start gap-2 col-span-2">
                                                        <span className="text-md font-semibold text-gray-700">Options</span>
                                                        <FieldArray name={`varieties.${index}.options`}>
                                                            {({ push: pushOption, remove: removeOption }) => (
                                                                <>
                                                                    {variety.options.map((option, optionIndex) => (
                                                                        <div key={optionIndex} className="w-full flex flex-col gap-3 p-3 bg-hippie-green-50 rounded-md border border-hippie-green-200">
                                                                            <div className="w-full flex items-center gap-2">
                                                                                <div className="flex-1">
                                                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Option Label</label>
                                                                                    <Field
                                                                                        name={`varieties.${index}.options.${optionIndex}.label`}
                                                                                        placeholder="Enter option label"
                                                                                        className="w-full focus:outline-none bg-hippie-green-100 border border-hippie-green-300 px-3 py-2 rounded-md"
                                                                                    />
                                                                                </div>
                                                                                <button
                                                                                    type="button"
                                                                                    onClick={() => removeOption(optionIndex)}
                                                                                    className="p-2 text-md bg-red-500 text-white rounded-md hover:bg-red-600 transition self-end"
                                                                                >
                                                                                    Remove
                                                                                </button>
                                                                            </div>
                                                                            <div className="w-full grid grid-cols-3 gap-3">
                                                                                <div>
                                                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹)</label>
                                                                                    <Field
                                                                                        name={`varieties.${index}.options.${optionIndex}.price`}
                                                                                        type="number"
                                                                                        placeholder="Enter price"
                                                                                        className="w-full focus:outline-none bg-hippie-green-100 border border-hippie-green-300 px-3 py-2 rounded-md"
                                                                                    />
                                                                                </div>
                                                                                <div>
                                                                                    <label className="block text-sm font-medium text-gray-700 mb-1">MRP (₹)</label>
                                                                                    <Field
                                                                                        name={`varieties.${index}.options.${optionIndex}.mrp`}
                                                                                        type="number"
                                                                                        placeholder="Enter MRP"
                                                                                        className="w-full focus:outline-none bg-hippie-green-100 border border-hippie-green-300 px-3 py-2 rounded-md"
                                                                                    />
                                                                                </div>
                                                                                <div>
                                                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                                                                                    <Field
                                                                                        name={`varieties.${index}.options.${optionIndex}.quantity`}
                                                                                        type="number"
                                                                                        placeholder="Enter quantity"
                                                                                        className="w-full focus:outline-none bg-hippie-green-100 border border-hippie-green-300 px-3 py-2 rounded-md"
                                                                                    />
                                                                                </div>
                                                                            </div>
                                                                            {errors.varieties?.[index]?.options?.[optionIndex] && touched.varieties?.[index]?.options?.[optionIndex] && (
                                                                                <div className="text-red-500 text-sm">
                                                                                    {Object.entries(errors.varieties[index].options[optionIndex]).map(([field, error]) => (
                                                                                        <p key={field}>{error}</p>
                                                                                    ))}
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    ))}
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => pushOption({ label: "", price: "", mrp: "", quantity: "" })}
                                                                        className="mt-2 px-3 py-1 bg-hippie-green-500 text-white rounded-md hover:bg-hippie-green-600"
                                                                    >
                                                                        Add Option
                                                                    </button>
                                                                </>
                                                            )}
                                                        </FieldArray>
                                                        {errors.varieties?.[index]?.options && touched.varieties?.[index]?.options && (
                                                            <span className="text-red-500 text-sm">
                                                                {typeof errors.varieties[index].options === 'string'
                                                                    ? errors.varieties[index].options
                                                                    : 'At least one option is required'}
                                                            </span>
                                                        )}
                                                    </div>

                                                    <div className="w-full flex flex-col items-start gap-2 col-span-2">
                                                        <span className="text-md font-semibold text-gray-700">Upload Images (Max 5)</span>
                                                        <input
                                                            type="file"
                                                            multiple
                                                            accept="image/*"
                                                            onChange={(e) => handleImagePreview(e, setFieldValue, index)}
                                                            className="w-full"
                                                        />
                                                        <div className="flex flex-wrap gap-2 mt-2">
                                                            {previewImages[index]?.map((preview, i) => (
                                                                <div key={i} className="relative group">
                                                                    <img
                                                                        src={preview}
                                                                        alt="Preview"
                                                                        className="w-20 h-20 object-cover rounded-md border"
                                                                    />
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => {
                                                                            setPreviewImages(prev => {
                                                                                const newPreviews = [...prev];
                                                                                newPreviews[index] = newPreviews[index].filter((_, idx) => idx !== i);
                                                                                return newPreviews;
                                                                            });
                                                                            setFieldValue(`varieties.${index}.imageFiles`, 
                                                                                values.varieties[index].imageFiles.filter((_, idx) => idx !== i)
                                                                            );
                                                                        }}
                                                                        className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                                                    >
                                                                        <IoClose size={12} />
                                                                    </button>
                                                                </div>
                                                            ))}
                                                        </div>
                                                        {errors.varieties?.[index]?.images && touched.varieties?.[index]?.images && (
                                                            <span className="text-red-500 text-sm">{errors.varieties[index].images}</span>
                                                        )}
                                                    </div>

                                                    <div className="col-span-2 flex items-center justify-end">
                                                        <button
                                                            type="button"
                                                            onClick={() => remove(index)}
                                                            className="bg-red-500 text-white px-3 py-2 rounded-md hover:bg-red-600 transition"
                                                        >
                                                            Remove Variant
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}

                                            <button
                                                type="button"
                                                onClick={() => push({
                                                    title: "",
                                                    options: [{ label: "", price: "", mrp: "", quantity: "" }],
                                                    images: []
                                                })}
                                                className="px-5 py-2 rounded-md border-[2px] border-hippie-green-500 text-hippie-green-500 font-semibold"
                                            >
                                                + Add Variant
                                            </button>
                                        </div>
                                    )}
                                </FieldArray>

                                <div className="w-full flex items-center justify-end">
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="bg-hippie-green-500 text-white w-[300px] py-2 rounded-md active:bg-hippie-green-600 disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                <span>Adding...</span>
                                            </>
                                        ) : (
                                            'Add Product'
                                        )}
                                    </button>
                                </div>
                            </Form>
                        </div>
                    </div>
                </>
            )}
        </Formik>
    );
};

export default AddProduct;
