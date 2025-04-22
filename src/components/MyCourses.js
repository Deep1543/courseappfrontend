import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const MyCourses = () => {
    const [myCourses, setMyCourses] = useState([]);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const { userId } = useParams();

    const calculateExpiryDate = (purchaseDate, duration) => {
        const date = new Date(purchaseDate);
        if (isNaN(date.getTime())) {
            console.error('Invalid purchase date:', purchaseDate);
            return null;
        }
        date.setMonth(date.getMonth() + duration);
        return date;
    };

    const isCourseExpired = (expiryDate) => {
        const currentDate = new Date();
        return expiryDate && expiryDate < currentDate;
    };

    const fetchCourses = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            setError('You need to be logged in to view your courses.');
            navigate('/login');
            return;
        }

        if (!userId) {
            setError('User ID is missing.');
            navigate('/login');
            return;
        }

        try {
            const response = await axios.get(`http://localhost:5000/courses/purchased/${userId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            const courses = response.data.map((course) => ({
                ...course,
                purchase_date: new Date(course.purchase_date),
                expiry_date: course.expiry_date
                    ? new Date(course.expiry_date)
                    : calculateExpiryDate(course.purchase_date, course.duration),
            }));

            setMyCourses(courses);
            setError(null);
        } catch (err) {
            console.error('Failed to fetch courses:', err);
            setError('Unable to fetch courses. Please try again later.');
        }
    };

    useEffect(() => {
        fetchCourses();
    }, [userId, navigate]);

    const formatDate = (date) => {
        const d = new Date(date);
        if (isNaN(d.getTime())) {
            return 'Invalid Date';
        }
        return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
    };

    return (
        <div className="container mx-auto p-6">
            {error && <div className="bg-red-100 text-red-700 p-4 mb-4 rounded">{error}</div>}
            <h2 className="text-3xl font-extrabold text-gray-800 mb-6 text-center">My Purchased Courses</h2>
            {myCourses.length === 0 ? (
                <p className="text-center text-lg text-gray-700">You haven't purchased any courses yet.</p>
            ) : (
                <table className="min-w-full bg-white border border-gray-300">
                    <thead>
                        <tr className="bg-blue-600 text-white">
                            <th className="border px-4 py-2">Course Name</th>
                            <th className="border px-4 py-2">Description</th>
                            <th className="border px-4 py-2">Price (₹)</th>
                            <th className="border px-4 py-2">Duration</th>
                            <th className="border px-4 py-2">Status</th>
                            <th className="border px-4 py-2">Purchase Date</th>
                            <th className="border px-4 py-2">Expiry Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {myCourses.map((course) => (
                            <tr key={course.id} className="text-center">
                                <td className="border px-4 py-2">{course.title || 'N/A'}</td>
                                <td className="border px-4 py-2">{course.description || 'N/A'}</td>
                                <td className="border px-4 py-2">{Number(course.price).toFixed(2)}</td>
                                <td className="border px-4 py-2">{course.duration} month{course.duration > 1 ? 's' : ''}</td>
                                <td className="border px-4 py-2">{course.status || 'Not available'}</td>
                                <td className="border px-4 py-2">{formatDate(course.purchase_date)}</td>
                                <td className="border px-4 py-2">{formatDate(course.expiry_date)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default MyCourses;
