import React, { useEffect, useState } from 'react';
import axios from 'axios';
import SendRenewalNotificationPage from './SendRenewalNotificationPage';

const PurchasedCoursesPage = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedCourse, setSelectedCourse] = useState(null);

    useEffect(() => {
        const fetchCourses = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                alert('No authentication token found. Please log in.');
                return;
            }
            try {
                const response = await axios.get('http://localhost:5000/admin/courses/purchased', {
                    headers: { Authorization: `Bearer ${token}` }
                });

                setCourses(response.data);
                setLoading(false);
            } catch (error) {
                setError(error.response?.data?.message || 'An error occurred');
                setLoading(false);
            }
        };

        fetchCourses();
    }, []);

    const formatDate = (date) => {
        if (!date) return 'Date not available';

        const parsedDate = new Date(date);
        if (isNaN(parsedDate)) return 'Invalid Date';

        return parsedDate.toLocaleDateString();
    };

    const daysUntilExpiry = (expiryDate) => {
        const currentDate = new Date();
        const expiry = new Date(expiryDate);
        const timeDiff = expiry - currentDate;
        return Math.ceil(timeDiff / (1000 * 3600 * 24));
    };

    const coursesByUser = courses.reduce((acc, course) => {
        const userId = course.user_name || 'Unknown User';
        if (!acc[userId]) {
            acc[userId] = [];
        }
        acc[userId].push(course);
        return acc;
    }, {});

    const handleViewDetails = (course) => {
        setSelectedCourse(course);
    };

    const handleCloseDetails = () => {
        setSelectedCourse(null);
    };

    const handleExpireIn7Days = (course) => {
        console.log('Sending renewal reminder for course:', course.title);
    };

    return (
        <div className="min-h-screen bg-gray-100 py-8 px-4">
            <div className="max-w-6xl mx-auto bg-white p-8 rounded-lg shadow-lg">
                <h1 className="text-3xl font-bold text-center text-blue-600 mb-6">Purchased Courses</h1>

                {loading && <p className="text-center text-lg text-gray-500">Loading courses...</p>}
                {error && <p className="text-center text-lg text-red-500">{error}</p>}

                <div className="overflow-x-auto">
                    <table className="min-w-full table-auto">
                        <thead className="bg-blue-600 text-white">
                            <tr>
                                <th className="py-3 px-6 text-left">User</th>
                                <th className="py-3 px-6 text-left">Course Name</th>
                                <th className="py-3 px-6 text-left">Purchase Date</th>
                                <th className="py-3 px-6 text-left">Price</th>
                                <th className="py-3 px-6 text-left">Duration</th>
                                <th className="py-3 px-6 text-left">Days Until Expiry</th>
                                <th className="py-3 px-6 text-left">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {Object.keys(coursesByUser).map((userId) =>
                                coursesByUser[userId].map((course, index) => {
                                    const courseName = course.title || 'Unknown Course';
                                    const purchaseDate = course.purchase_date || 'Not Available';
                                    const price = course.price || 'Not Available';
                                    const duration = course.duration || 'Not Available';
                                    const expiryDate = course.expiry_date || null;
                                    const daysLeft = expiryDate ? daysUntilExpiry(expiryDate) : null;

                                    const highlightClass = daysLeft <= 7 && daysLeft >= 0;
                                    const expireButtonClass = daysLeft <= 7 && daysLeft >= 0 ? 'bg-red-500 text-white' : 'bg-gray-400 text-gray-700';

                                    return (
                                        <tr
                                            key={`${course.id || index}-${userId}`}
                                            className={`border-b hover:bg-gray-50 ${highlightClass ? 'bg-yellow-100' : ''}`}
                                        >
                                            <td className="py-3 px-6 text-sm font-medium text-gray-900">{userId}</td>
                                            <td className="py-3 px-6 text-sm font-medium text-gray-900">{courseName}</td>
                                            <td className="py-3 px-6 text-sm font-medium text-gray-900">{formatDate(purchaseDate)}</td>
                                            <td className="py-3 px-6 text-sm font-medium text-gray-900">₹{price}</td>
                                            <td className="py-3 px-6 text-sm font-medium text-gray-900">{duration} months</td>
                                            <td className="py-3 px-6 text-sm font-medium text-gray-900">
                                                {daysLeft !== null ? `${daysLeft} days` : 'N/A'}
                                            </td>
                                            <td className="py-3 px-6 text-sm font-medium text-center">
                                                {daysLeft <= 7 && daysLeft >= 0 && (
                                                    <button
                                                        className={`${expireButtonClass} py-1 px-3 rounded-lg hover:bg-yellow-600`}
                                                        onClick={() => handleExpireIn7Days(course)}
                                                    >
                                                        Expire in {daysLeft} Days
                                                    </button>
                                                )}
                                                <button
                                                    className="py-3 px-6 text-sm font-medium text-center text-blue-600 hover:text-blue-800 ml-2"
                                                    onClick={() => handleViewDetails(course)}
                                                >
                                                    View Details
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {selectedCourse && (
                    <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center z-50">
                        <div className="bg-white p-8 rounded-lg shadow-lg max-w-lg w-full">
                            <h2 className="text-2xl font-bold text-blue-600 mb-4">Course Details</h2>
                            <p><strong>Course Name:</strong> {selectedCourse.title}</p>
                            <p><strong>Course Description:</strong> {selectedCourse.description || 'No description available.'}</p>
                            <p><strong>Price:</strong> ₹{selectedCourse.price}</p>
                            <p><strong>Duration:</strong> {selectedCourse.duration} weeks</p>
                            <p><strong>Purchase Date:</strong> {formatDate(selectedCourse.purchase_date)}</p>
                            <p><strong>Expiry Date:</strong> {formatDate(selectedCourse.expiry_date)}</p>

                            <div className="mt-4 flex justify-end">
                                <button
                                    className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                                    onClick={handleCloseDetails}
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                <SendRenewalNotificationPage />
            </div>
        </div>
    );
};

export default PurchasedCoursesPage;
