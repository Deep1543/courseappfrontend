import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext'; // Ensure this context is properly set up

const UserByCoursePage = () => {
    const [userCourses, setUserCourses] = useState([]);
    const [error, setError] = useState(null);
    const { user } = useAuth(); // Get the current user data from context

    useEffect(() => {
        const fetchUserCourses = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    setError('No token found. Please log in.');
                    return;
                }

                // Fetch user courses from the backend API
                const response = await axios.get('http://localhost:5000/user/courses', {
                    headers: { Authorization: `Bearer ${token}` },
                });

                console.log('Response from backend:', response.data); // Log response for debugging

                // Check if the response contains courses and display them
                if (response.data.courses && response.data.courses.length > 0) {
                    setUserCourses(response.data.courses);
                } else {
                    setError('No courses found for this user.');
                }
            } catch (error) {
                console.error('Error fetching user courses:', error);

                // Handle error responses
                if (error.response && error.response.status === 401) {
                    setError('Unauthorized access. Please log in.');
                } else if (error.response && error.response.status === 404) {
                    setError('No courses found for this user.');
                } else if (error.response && error.response.status === 500) {
                    setError('Server error. Please try again later.');
                } else {
                    setError('Error fetching user courses. Please try again.');
                }
            }
        };

        fetchUserCourses();
    }, [user]); // Added user as dependency to re-fetch when user data changes

    return (
        <div className="container mx-auto p-6">
            <h2 className="text-2xl font-bold mb-4">Your Purchased Courses</h2>

            {/* Display error message if exists */}
            {error && <p className="text-red-500">{error}</p>}

            {/* Display user courses if they exist */}
            {userCourses.length === 0 && !error ? (
                <p>No courses purchased yet.</p>
            ) : (
                <ul>
                    {userCourses.map(course => (
                        <li key={course.id} className="p-4 border rounded mb-2">
                            <h3 className="text-lg font-bold">{course.title}</h3>
                            <p>Purchased on: {new Date(course.purchaseDate).toLocaleDateString()}</p>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default UserByCoursePage;
