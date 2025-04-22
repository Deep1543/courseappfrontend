import React, { useEffect, useState } from 'react';
import axios from 'axios';

const NonAdminDashboard = () => {
    const [userDetails, setUserDetails] = useState(null);
    const [courses, setCourses] = useState([]);
    const [loadingUser, setLoadingUser] = useState(true);
    const [loadingCourses, setLoadingCourses] = useState(true);
    const [error, setError] = useState('');
    const [image, setImage] = useState(null);
    const [profileImage, setProfileImage] = useState('');

    const getToken = () => localStorage.getItem('token');

    // Fetch user details and courses
    useEffect(() => {
        const fetchCourses = async () => {
            const token = getToken();

            // Fetch user details
            try {
                const userResponse = await axios.get('http://localhost:5000/users/me', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setUserDetails(userResponse.data);
                console.log('User Details:', userResponse.data); // Debugging: Check the user data
            } catch (error) {
                setError('Failed to load user details.');
            } finally {
                setLoadingUser(false);
            }

            // Fetch courses that user has bought
            try {
                const response = await axios.get('http://localhost:5000/users/me/courses', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setCourses(response.data);
            } catch (error) {
                setError('Failed to load courses.');
            } finally {
                setLoadingCourses(false);
            }
        };

        fetchCourses();

        // Retrieve profile image based on user ID
        const storedProfileImage = localStorage.getItem(`userProfileImage_${userDetails?.id}`);
        if (storedProfileImage) {
            setProfileImage(storedProfileImage);
        } else {
            setProfileImage("http://localhost:5000/uploads/profile_images/default.jpg"); // Default image
        }
    }, [userDetails]);

    const handleImageChange = (event) => {
        const file = event.target.files[0];
        console.log("Selected file:", file);
        setImage(file);
    };

    const handleImageUpload = async () => {
        if (!image) {
            console.error("No image selected");
            return;
        }

        const formData = new FormData();
        formData.append('image', image);

        try {
            const response = await axios.post(
                'http://localhost:5000/upload-profile-image',
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        'Authorization': `Bearer ${localStorage.getItem("token")}`,
                    }
                }
            );

            console.log('Image uploaded:', response.data);

            // Store the image URL in localStorage for this specific user ID
            const imageUrl = response.data.profileImageUrl;
            localStorage.setItem(`userProfileImage_${userDetails?.id}`, imageUrl); // Store image URL with user ID as key
            setProfileImage(imageUrl);

        } catch (error) {
            console.error('Error uploading image:', error);
        }
    };
    

    // Loading state
    if (loadingUser || loadingCourses) {
        return <div>Loading...</div>;
    }

    return (
        <div className="container mx-auto p-6">
            <div className="max-w-7xl mx-auto bg-white p-8 rounded-lg shadow-lg">
                <div className="flex flex-col items-center">
                    <img
                        src={decodeURIComponent(profileImage)} // ✅ Decode any encoded characters (e.g., %20)
                        alt="Profile"
                        className="w-32 h-32 rounded-full border-4 border-white object-cover" // Increased size
                    />

                    <h1 className="text-3xl font-semibold text-center mb-6">Dashboard</h1>
                </div>
                <div className="mt-6">
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                    />
                    <button
                        onClick={handleImageUpload}
                        className="bg-blue-500 text-white py-2 px-4 rounded ml-2"
                    >
                        Upload Image
                    </button>
                </div>
            </div>

            {/* User Details Section */}
            <div className="bg-white p-6 rounded-lg shadow-lg mb-6">
                <h2 className="text-xl font-bold text-gray-700">Welcome, {userDetails?.name}</h2>
                <p>Email: {userDetails?.email}</p>
                <p>User ID: {userDetails?.id}</p> {/* Display User ID */}
            </div>

            {/* Courses Section */}
            <div className="bg-white p-6 rounded-lg shadow-lg">
                <h3 className="text-xl font-semibold text-gray-700 mb-4">Courses Added</h3>
                {courses.length > 0 ? (
                    <ul className="space-y-2">
                        {courses.map((course) => (
                            <li key={course.course_id} className="text-gray-600">
                                <strong>{course.course_title}</strong>
                                <div>
                                    {course.user_name ? (
                                        <span className="text-green-500">
                                            This course has been added by {course.user_name}.
                                        </span>
                                    ) : (
                                        <span className="text-red-500">
                                            This course has not added by {course.user_name}.
                                        </span>
                                    )}
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>No courses found.</p>
                )}
            </div>

            {/* Error Message */}
            {error && (
                <div className="bg-red-500 text-white p-4 rounded-lg mt-6">
                    <p>{error}</p>
                </div>
            )}
        </div>
    );
};

export default NonAdminDashboard;




