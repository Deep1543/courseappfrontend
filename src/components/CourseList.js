import React, { useState, useEffect } from "react";
import axios from "axios";

const CourseList = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true); // To track loading state
    const [error, setError] = useState(null); // To track any errors

    useEffect(() => {
        // Fetch the user's courses from the backend
        const fetchCourses = async () => {
            try {
                const response = await axios.get("http://localhost:5000/api/user/courses");
                console.log('Fetched courses:', response.data); // For debugging
                setCourses(response.data);
            } catch (error) {
                setError("Error fetching courses");
                console.error("Error fetching courses:", error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchCourses();
    }, []);

    // Handle loading and error states
    if (loading) return <p>Loading courses...</p>;
    if (error) return <p>{error}</p>;

    return (
        <div className="course-list">
            <h1>Your Courses</h1>
            {courses.length === 0 ? (
                <p>No courses available</p>
            ) : (
                <table>
                    <thead>
                        <tr>
                            <th>Course Title</th>
                            <th>Price</th>
                            <th>Expiry Date</th>
                            <th>Time Remaining</th>
                        </tr>
                    </thead>
                    <tbody>
                        {courses.map((course) => (
                            <tr key={course.id}>
                                <td>{course.title}</td>
                                <td>{course.price}</td>
                                <td>{new Date(course.expiry_date).toLocaleDateString()}</td>
                                <td>{course.time_remaining}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default CourseList;
