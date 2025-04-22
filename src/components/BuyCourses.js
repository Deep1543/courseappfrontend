import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaShoppingCart, FaExclamationCircle, FaCheckCircle, FaSearch } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { jwtDecode } from 'jwt-decode';

const BuyCourses = () => {
    const [courses, setCourses] = useState([]);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [selectedEMIPlan, setSelectedEMIPlan] = useState(null);
    const [filteredCourses, setFilteredCourses] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('creditCard');
    const [creditCardDetails, setCreditCardDetails] = useState({
        cardNumber: '',
        expiryDate: '',
        cvv: '',
    });
    const [debitCardDetails, setDebitCardDetails] = useState({
        cardNumber: '',
        expiryDate: '',
        cvv: '',
    });
    const [upiId, setUpiId] = useState('');
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        axios.get('http://localhost:5000/courses')
            .then(response => {
                console.log('Courses:', response.data);
                setCourses(response.data);
                setFilteredCourses(response.data); // Set the filtered courses initially
            })
            .catch(error => {
                console.error('Error fetching courses:', error);
            });
    }, []);

    // Handle search logic
    useEffect(() => {
        if (searchQuery.trim() === '') {
            setFilteredCourses(courses); // Show all if no search query
        } else {
            const regex = new RegExp(searchQuery.toLowerCase(), "i"); // Partial match (not whole-word match)

            // Find all matching courses based on the title
            const matchingCourses = courses.filter(course =>
                regex.test(course.title.toLowerCase()) || regex.test(course.description.toLowerCase())
            );

            setFilteredCourses(matchingCourses);
        }
    }, [searchQuery, courses]);

    const handleCreditCardChange = (e) => {
        setCreditCardDetails({
            ...creditCardDetails,
            [e.target.name]: e.target.value,
        });
    };

    const handleDebitCardChange = (e) => {
        setDebitCardDetails({
            ...debitCardDetails,
            [e.target.name]: e.target.value,
        });
    };

    const handleUpiChange = (e) => {
        setUpiId(e.target.value);
    };

    const handleBuyCourse = async (courseId) => {
        const token = localStorage.getItem('token');
        if (!token) {
            setError('You need to be logged in to buy a course.');
            return;
        }

        if (!selectedEMIPlan) {
            setError('Please select an EMI plan.');
            return;
        }

        if (paymentMethod === 'creditCard' && (!creditCardDetails.cardNumber || !creditCardDetails.expiryDate || !creditCardDetails.cvv)) {
            setError('Please enter complete credit card details.');
            return;
        }
        if (paymentMethod === 'debitCard' && (!debitCardDetails.cardNumber || !debitCardDetails.expiryDate || !debitCardDetails.cvv)) {
            setError('Please enter complete debit card details.');
            return;
        }
        if (paymentMethod === 'upi' && !upiId) {
            setError('Please enter your UPI ID.');
            return;
        }

        try {
            const decodedToken = jwtDecode(token);
            const userRole = decodedToken.role;
            const userName = decodedToken.name;

            if (userRole !== 'user') {
                setError('Only members can buy courses.');
                return;
            }

            const confirmPurchase = window.confirm(`Are you sure you want to purchase this course with the ${selectedEMIPlan} month EMI plan?`);
            if (!confirmPurchase) return;

            if (!selectedCourse || !selectedCourse.price) {
                setError('Invalid course selected.');
                return;
            }

            const coursePrice = parseFloat(selectedCourse.price);
            const emiAmount = coursePrice / selectedEMIPlan;
            const purchaseData = {
                start_date: new Date().toISOString(),
                emiPlan: selectedEMIPlan,
                emiAmount: emiAmount,
                paymentMethod,
                creditCardDetails: paymentMethod === 'creditCard' ? creditCardDetails : null,
                debitCardDetails: paymentMethod === 'debitCard' ? debitCardDetails : null,
                upiId: paymentMethod === 'upi' ? upiId : null,
                userName: userName,
            };

            const response = await axios.post(
                `http://localhost:5000/courses/buy/${courseId}`,
                purchaseData,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                }
            );

            setSuccessMessage('Course purchased successfully with EMI!');
            setError(null);
            navigate(`/my-courses/${decodedToken.id}`);

        } catch (error) {
            console.error('Error buying course:', error.response ? error.response.data : error.message);
            if (error.response) {
                if (error.response.status === 403) {
                    setError('You do not have permission to purchase this course.');
                } else if (error.response.status === 404) {
                    setError('Course not found. Please try again.');
                } else {
                    setError('An error occurred while purchasing the course. Please try again.');
                }
            } else {
                setError('Network error. Please check your connection and try again.');
            }
        }
    };

    const openCourseDetails = (course) => {
        setSelectedCourse(course);
        setSelectedEMIPlan(null);
        setCreditCardDetails({
            cardNumber: '',
            expiryDate: '',
            cvv: '',
        });
        setDebitCardDetails({
            cardNumber: '',
            expiryDate: '',
            cvv: '',
        });
        setUpiId('');
    };

    const closeCourseDetails = () => {
        setSelectedCourse(null);
        setSelectedEMIPlan(null);
        setCreditCardDetails({
            cardNumber: '',
            expiryDate: '',
            cvv: '',
        });
        setDebitCardDetails({
            cardNumber: '',
            expiryDate: '',
            cvv: '',
        });
        setUpiId('');
    };

    const handleEMISelection = (emiPlan) => {
        setSelectedEMIPlan(emiPlan);
        setError(null);
    };

    const handlePaymentMethodChange = (method) => {
        setPaymentMethod(method);
        setError(null);
    };

    return (
        <div className="container mx-auto p-6">
            {/* Search Box */}
            <div className="mb-6 flex items-center bg-gray-100 p-3 rounded-lg">
                <FaSearch className="text-gray-500 mr-3" />
                <input
                    type="text"
                    placeholder="Search for a course..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-transparent outline-none w-full"
                />
            </div>

            {/* Course List (filtered to show only one match) */}
            <h2 className="text-3xl font-extrabold text-gray-800 mb-6 text-center">
                {filteredCourses.length > 0 ? `Found ${filteredCourses.length} Course(s)` : "No Course Found"}
            </h2>
            {error && (
                <div className="flex items-center bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    <FaExclamationCircle className="mr-2" />
                    <span>{error}</span>
                </div>
            )}
            {successMessage && (
                <div className="flex items-center bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                    <FaCheckCircle className="mr-2" />
                    <span>{successMessage}</span>
                </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCourses.map(course => (
                    <div key={course.id} className="bg-white shadow-md rounded-lg p-6">
                        <img src={course.image_url} alt={course.title} className="w-full h-40 object-cover rounded-lg mb-4" />

                        <h3 className="text-xl font-bold text-gray-800">{course.title}</h3>
                        <p className="text-sm text-gray-600 mt-2">{course.description}</p>
                        <p className="text-sm text-gray-600 mt-2">Duration: {course.duration} months</p>
                        <p className="mt-4 font-semibold text-lg text-gray-900">₹{course.price}</p>
                        <button
                            onClick={() => openCourseDetails(course)}
                            className="mt-4 bg-blue-500 text-white py-2 px-4 rounded-lg"
                        >
                            Buy Now
                        </button>
                    </div>
                ))}
            </div>

            {/* Course Details Modal */}
            {selectedCourse && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-10">
                    <div className="bg-white p-6 rounded-lg shadow-lg max-w-lg w-full">
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">{selectedCourse.title}</h2>
                        <p className="text-gray-600 mb-4">{selectedCourse.description}</p>
                        <p className="font-semibold text-lg text-gray-900">Price: ₹{selectedCourse.price}</p>

                        {/* EMI Plan Selector */}
                        <div className="mt-6">
                            <p className="font-medium">Select EMI Plan:</p>
                            <div className="grid grid-cols-2 gap-4 mt-2">
                                {[3, 6, 12].map(emi => (
                                    <button
                                        key={emi}
                                        onClick={() => handleEMISelection(emi)}
                                        className={`py-2 px-4 border rounded-lg ${selectedEMIPlan === emi ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-800'}`}
                                    >
                                        {emi} Months
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Payment Method Selector */}
                        <div className="mt-6">
                            <p className="font-medium">Payment Method:</p>
                            <div className="flex items-center space-x-4 mt-2">
                                <label>
                                    <input
                                        type="radio"
                                        name="paymentMethod"
                                        value="creditCard"
                                        checked={paymentMethod === 'creditCard'}
                                        onChange={() => handlePaymentMethodChange('creditCard')}
                                    />
                                    Credit Card
                                </label>
                                <label>
                                    <input
                                        type="radio"
                                        name="paymentMethod"
                                        value="debitCard"
                                        checked={paymentMethod === 'debitCard'}
                                        onChange={() => handlePaymentMethodChange('debitCard')}
                                    />
                                    Debit Card
                                </label>
                                <label>
                                    <input
                                        type="radio"
                                        name="paymentMethod"
                                        value="upi"
                                        checked={paymentMethod === 'upi'}
                                        onChange={() => handlePaymentMethodChange('upi')}
                                    />
                                    UPI
                                </label>
                            </div>
                        </div>

                        {/* Payment Details Form */}
                        {paymentMethod === 'creditCard' && (
                            <div className="mt-4">
                                <input
                                    type="text"
                                    name="cardNumber"
                                    placeholder="Card Number"
                                    value={creditCardDetails.cardNumber}
                                    onChange={handleCreditCardChange}
                                    className="w-full p-2 border rounded-lg mb-2"
                                />
                                <input
                                    type="text"
                                    name="expiryDate"
                                    placeholder="Expiry Date"
                                    value={creditCardDetails.expiryDate}
                                    onChange={handleCreditCardChange}
                                    className="w-full p-2 border rounded-lg mb-2"
                                />
                                <input
                                    type="text"
                                    name="cvv"
                                    placeholder="CVV"
                                    value={creditCardDetails.cvv}
                                    onChange={handleCreditCardChange}
                                    className="w-full p-2 border rounded-lg"
                                />
                            </div>
                        )}
                        {paymentMethod === 'debitCard' && (
                            <div className="mt-4">
                                <input
                                    type="text"
                                    name="cardNumber"
                                    placeholder="Card Number"
                                    value={debitCardDetails.cardNumber}
                                    onChange={handleDebitCardChange}
                                    className="w-full p-2 border rounded-lg mb-2"
                                />
                                <input
                                    type="text"
                                    name="expiryDate"
                                    placeholder="Expiry Date"
                                    value={debitCardDetails.expiryDate}
                                    onChange={handleDebitCardChange}
                                    className="w-full p-2 border rounded-lg mb-2"
                                />
                                <input
                                    type="text"
                                    name="cvv"
                                    placeholder="CVV"
                                    value={debitCardDetails.cvv}
                                    onChange={handleDebitCardChange}
                                    className="w-full p-2 border rounded-lg"
                                />
                            </div>
                        )}
                        {paymentMethod === 'upi' && (
                            <div className="mt-4">
                                <input
                                    type="text"
                                    name="upiId"
                                    placeholder="UPI ID"
                                    value={upiId}
                                    onChange={handleUpiChange}
                                    className="w-full p-2 border rounded-lg"
                                />
                            </div>
                        )}

                        {/* Confirm Purchase Button */}
                        <div className="mt-6 flex justify-between">
                            <button
                                onClick={closeCourseDetails}
                                className="bg-gray-300 text-gray-700 py-2 px-4 rounded-lg"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleBuyCourse(selectedCourse.id)}
                                className="bg-blue-500 text-white py-2 px-4 rounded-lg"
                            >
                                Confirm Purchase
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BuyCourses;
