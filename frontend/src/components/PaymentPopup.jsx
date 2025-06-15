import React, { useState } from 'react';
import { FaCreditCard, FaMobileAlt, FaRupeeSign, FaLock, FaMoneyBillWave } from 'react-icons/fa';
import { useFormik } from 'formik';
import * as Yup from 'yup';

// Card type detection patterns
const CARD_PATTERNS = {
    visa: /^4[0-9]{12}(?:[0-9]{3})?$/,
    mastercard: /^5[1-5][0-9]{14}$/,
    amex: /^3[47][0-9]{13}$/,
    discover: /^6(?:011|5[0-9]{2})[0-9]{12}$/,
    rupay: /^6[0-9]{15}$/
};

// Card type icons
const CARD_ICONS = {
    general: 'https://cdn-icons-png.flaticon.com/128/9334/9334539.png',
    visa: 'https://cdn-icons-png.flaticon.com/128/196/196578.png',
    mastercard: 'https://cdn-icons-png.flaticon.com/128/11378/11378185.png',
    amex: 'https://cdn-icons-png.flaticon.com/512/349/349229.png',
    discover: 'https://cdn-icons-png.flaticon.com/512/349/349230.png',
    rupay: 'https://cdn-icons-png.flaticon.com/128/11378/11378315.png'
};

const PaymentPopup = ({ amount, onClose, onSuccess }) => {
    const [paymentMethod, setPaymentMethod] = useState('card');
    const [cardType, setCardType] = useState(null);
    const [showOTP, setShowOTP] = useState(false);
    const [processingPayment, setProcessingPayment] = useState(false);

    // Card validation schema
    const cardValidationSchema = Yup.object({
        cardNumber: Yup.string()
            .required('Card number is required')
            .matches(/^[0-9]{16}$/, 'Card number must be 16 digits'),
        cardHolder: Yup.string()
            .required('Card holder name is required')
            .matches(/^[a-zA-Z\s]*$/, 'Only letters and spaces are allowed'),
        expiryDate: Yup.string()
            .required('Expiry date is required')
            .matches(/^(0[1-9]|1[0-2])\/([0-9]{2})$/, 'Invalid expiry date (MM/YY)')
            .test('expiry', 'Card has expired', function(value) {
                if (!value) return false;
                const [month, year] = value.split('/');
                const expiry = new Date(2000 + parseInt(year), parseInt(month) - 1);
                return expiry > new Date();
            }),
        cvv: Yup.string()
            .required('CVV is required')
            .matches(/^[0-9]{3,4}$/, 'CVV must be 3 or 4 digits'),
        otp: Yup.string()
            .when('showOTP', {
                is: true,
                then: Yup.string()
                    .required('OTP is required')
                    .matches(/^[0-9]{6}$/, 'OTP must be 6 digits')
            })
    });

    // UPI validation schema
    const upiValidationSchema = Yup.object({
        upiId: Yup.string()
            .required('UPI ID is required')
            .matches(/^[a-zA-Z0-9._-]+@[a-zA-Z]{3,}$/, 'Invalid UPI ID')
    });

    const cardFormik = useFormik({
        initialValues: {
            cardNumber: '',
            cardHolder: '',
            expiryDate: '',
            cvv: '',
            otp: ''
        },
        validationSchema: cardValidationSchema,
        onSubmit: async (values) => {
            if (!showOTP) {
                setShowOTP(true);
                return;
            }
            await handlePayment(values);
        }
    });

    const upiFormik = useFormik({
        initialValues: {
            upiId: ''
        },
        validationSchema: upiValidationSchema,
        onSubmit: async (values) => {
            await handlePayment(values);
        }
    });

    const detectCardType = (number) => {
        for (const [type, pattern] of Object.entries(CARD_PATTERNS)) {
            if (pattern.test(number)) {
                return type;
            }
        }
        return null;
    };

    const handleCardNumberChange = (e) => {
        const value = e.target.value.replace(/\D/g, '').slice(0, 16);
        cardFormik.setFieldValue('cardNumber', value);
        setCardType(detectCardType(value));
    };

    const handleExpiryDateChange = (e) => {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length >= 2) {
            value = value.slice(0, 2) + '/' + value.slice(2, 4);
        }
        cardFormik.setFieldValue('expiryDate', value);
    };

    const handlePayment = async (values) => {
        try {
            setProcessingPayment(true);
            // Simulate payment processing
            await new Promise(resolve => setTimeout(resolve, 2000));
            // For COD, pass 'COD' as the payment method
            onSuccess(paymentMethod === 'cod' ? 'COD' : paymentMethod.toUpperCase());
        } catch (error) {
            console.error('Payment error:', error);
        } finally {
            setProcessingPayment(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
                <div className="p-6 border-b border-gray-100">
                    <div className="flex justify-between items-center">
                        <div>
                            <h3 className="text-xl font-bold">Payment</h3>
                            <p className="text-sm text-gray-600 mt-1">
                                Amount to pay: <span className="font-semibold"><FaRupeeSign className="inline-block h-3 w-3" />{amount}</span>
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-2xl text-gray-400 hover:text-gray-600"
                        >
                            ×
                        </button>
                    </div>
                </div>

                <div className="p-6">
                    <div className="flex gap-4 mb-6">
                        <button
                            onClick={() => setPaymentMethod('card')}
                            className={`flex-1 py-3 rounded-lg font-medium transition-all ${
                                paymentMethod === 'card'
                                    ? 'bg-hippie-green-600 text-white'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                        >
                            <FaCreditCard className="inline-block mr-2" />
                            Card
                        </button>
                        <button
                            onClick={() => setPaymentMethod('upi')}
                            className={`flex-1 py-3 rounded-lg font-medium transition-all ${
                                paymentMethod === 'upi'
                                    ? 'bg-hippie-green-600 text-white'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                        >
                            <FaMobileAlt className="inline-block mr-2" />
                            UPI
                        </button>
                        <button
                            onClick={() => setPaymentMethod('cod')}
                            className={`flex-1 py-3 rounded-lg font-medium transition-all ${
                                paymentMethod === 'cod'
                                    ? 'bg-hippie-green-600 text-white'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                        >
                            <FaMoneyBillWave className="inline-block mr-2" />
                            COD
                        </button>
                    </div>

                    {paymentMethod === 'cod' ? (
                        <div className="space-y-4">
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h4 className="font-medium text-gray-900 mb-2">Cash on Delivery</h4>
                                <p className="text-sm text-gray-600">
                                    Pay <FaRupeeSign className="inline-block h-3 w-3" />{amount} when your order arrives
                                </p>
                            </div>
                            <button
                                onClick={() => handlePayment({ type: 'cod' })}
                                disabled={processingPayment}
                                className={`w-full py-3 rounded-lg font-medium transition-all ${
                                    processingPayment
                                        ? 'bg-gray-300 cursor-not-allowed'
                                        : 'bg-hippie-green-600 text-white hover:bg-hippie-green-700'
                                }`}
                            >
                                {processingPayment ? (
                                    <div className="flex items-center justify-center">
                                        <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                                        Processing...
                                    </div>
                                ) : (
                                    <span>Place Order</span>
                                )}
                            </button>
                        </div>
                    ) : paymentMethod === 'card' ? (
                        <form onSubmit={cardFormik.handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Card Number
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        name="cardNumber"
                                        placeholder="1234 5678 9012 3456"
                                        value={cardFormik.values.cardNumber}
                                        onChange={handleCardNumberChange}
                                        onBlur={cardFormik.handleBlur}
                                        className="w-full border border-gray-300 p-3 rounded-lg outline-none focus:ring-2 focus:ring-hippie-green-500 focus:border-transparent transition-all pl-12"
                                    />
                                    {cardType ? (
                                        <img
                                            src={CARD_ICONS[cardType]}
                                            alt={cardType}
                                            className="absolute left-3 top-1/2 transform -translate-y-1/2 h-6 w-auto"
                                        />
                                    ) : (
                                        <img
                                            src={CARD_ICONS.general}
                                            alt="card"
                                            className="absolute left-3 top-1/2 transform -translate-y-1/2 h-6 w-auto opacity-60"
                                        />
                                    )}
                                </div>
                                {cardFormik.touched.cardNumber && cardFormik.errors.cardNumber && (
                                    <p className="text-sm text-red-500 mt-1">{cardFormik.errors.cardNumber}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Card Holder Name
                                </label>
                                <input
                                    type="text"
                                    name="cardHolder"
                                    placeholder="John Doe"
                                    value={cardFormik.values.cardHolder}
                                    onChange={cardFormik.handleChange}
                                    onBlur={cardFormik.handleBlur}
                                    className="w-full border border-gray-300 p-3 rounded-lg outline-none focus:ring-2 focus:ring-hippie-green-500 focus:border-transparent transition-all"
                                />
                                {cardFormik.touched.cardHolder && cardFormik.errors.cardHolder && (
                                    <p className="text-sm text-red-500 mt-1">{cardFormik.errors.cardHolder}</p>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Expiry Date
                                    </label>
                                    <input
                                        type="text"
                                        name="expiryDate"
                                        placeholder="MM/YY"
                                        value={cardFormik.values.expiryDate}
                                        onChange={handleExpiryDateChange}
                                        onBlur={cardFormik.handleBlur}
                                        className="w-full border border-gray-300 p-3 rounded-lg outline-none focus:ring-2 focus:ring-hippie-green-500 focus:border-transparent transition-all"
                                    />
                                    {cardFormik.touched.expiryDate && cardFormik.errors.expiryDate && (
                                        <p className="text-sm text-red-500 mt-1">{cardFormik.errors.expiryDate}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        CVV
                                    </label>
                                    <input
                                        type="text"
                                        name="cvv"
                                        placeholder="123"
                                        value={cardFormik.values.cvv}
                                        onChange={cardFormik.handleChange}
                                        onBlur={cardFormik.handleBlur}
                                        className="w-full border border-gray-300 p-3 rounded-lg outline-none focus:ring-2 focus:ring-hippie-green-500 focus:border-transparent transition-all"
                                    />
                                    {cardFormik.touched.cvv && cardFormik.errors.cvv && (
                                        <p className="text-sm text-red-500 mt-1">{cardFormik.errors.cvv}</p>
                                    )}
                                </div>
                            </div>

                            {showOTP && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Enter OTP
                                    </label>
                                    <input
                                        type="text"
                                        name="otp"
                                        placeholder="Enter 6-digit OTP"
                                        value={cardFormik.values.otp}
                                        onChange={cardFormik.handleChange}
                                        onBlur={cardFormik.handleBlur}
                                        className="w-full border border-gray-300 p-3 rounded-lg outline-none focus:ring-2 focus:ring-hippie-green-500 focus:border-transparent transition-all"
                                    />
                                    {cardFormik.touched.otp && cardFormik.errors.otp && (
                                        <p className="text-sm text-red-500 mt-1">{cardFormik.errors.otp}</p>
                                    )}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={processingPayment}
                                className={`w-full py-3 rounded-lg font-medium transition-all ${
                                    processingPayment
                                        ? 'bg-gray-300 cursor-not-allowed'
                                        : 'bg-hippie-green-600 text-white hover:bg-hippie-green-700'
                                }`}
                            >
                                {processingPayment ? (
                                    <div className="flex items-center justify-center">
                                        <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                                        Processing...
                                    </div>
                                ) : showOTP ? (
                                    'Verify & Pay'
                                ) : (
                                    <span>Continue to OTP</span>
                                )}
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={upiFormik.handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    UPI ID
                                </label>
                                <input
                                    type="text"
                                    name="upiId"
                                    placeholder="username@upi"
                                    value={upiFormik.values.upiId}
                                    onChange={upiFormik.handleChange}
                                    onBlur={upiFormik.handleBlur}
                                    className="w-full border border-gray-300 p-3 rounded-lg outline-none focus:ring-2 focus:ring-hippie-green-500 focus:border-transparent transition-all"
                                />
                                {upiFormik.touched.upiId && upiFormik.errors.upiId && (
                                    <p className="text-sm text-red-500 mt-1">{upiFormik.errors.upiId}</p>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={processingPayment}
                                className={`w-full py-3 rounded-lg font-medium transition-all ${
                                    processingPayment
                                        ? 'bg-gray-300 cursor-not-allowed'
                                        : 'bg-hippie-green-600 text-white hover:bg-hippie-green-700'
                                }`}
                            >
                                {processingPayment ? (
                                    <div className="flex items-center justify-center">
                                        <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                                        Processing...
                                    </div>
                                ) : (
                                    <span>Pay <FaRupeeSign className="inline-block h-3 w-3" />{amount}</span>
                                )}
                            </button>
                        </form>
                    )}

                    <div className="mt-4 flex items-center justify-center text-sm text-gray-500">
                        <FaLock className="mr-2" />
                        Your payment information is secure
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PaymentPopup; 