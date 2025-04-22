import React, { useState, useEffect } from "react";
import axios from "axios";

const Admin = () => {
    const [expiringCourses, setExpiringCourses] = useState([]);
    const [error, setError] = useState(""); // Error state to show error messages
    const [loading, setLoading] = useState(false); // Loading state to handle async requests

    useEffect(() => {
        // Fetch the list of expiring courses from the backend
        const fetchExpiringCourses = async () => {
            setLoading(true); // Set loading to true while fetching data
            try {
                const response = await axios.get("http://localhost:5000/expiring-courses");
                setExpiringCourses(response.data);
                setError(""); // Clear error if data is fetched successfully
            } catch (error) {
                console.error("Error fetching expiring courses:", error.message);
                setError("Failed to load expiring courses.");
            } finally {
                setLoading(false); // Set loading to false after request is completed
            }
        };

        fetchExpiringCourses();
    }, []);

    const sendNotifications = async () => {
        setLoading(true); // Set loading to true while sending notifications
        try {
            const response = await axios.post("http://localhost:5000/send-notifications");
            alert(response.data.message); // Show success message
            setError(""); // Clear error if successful
            // Re-fetch the courses to show the updated data
            const updatedCourses = await axios.get("http://localhost:5000/expiring-courses");
            setExpiringCourses(updatedCourses.data);
        } catch (error) {
            console.error("Error sending notifications:", error.message);
            setError("Failed to send notifications.");
        } finally {
            setLoading(false); // Set loading to false after request is completed
        }
    };

    return (
        <div className="admin-dashboard">
            <h1>Admin Dashboard - Expiring Courses</h1>
            {error && <p className="error-message">{error}</p>} {/* Display error if there is one */}

            <button onClick={sendNotifications} disabled={loading}>
                {loading ? "Sending..." : "Send Notifications"}
            </button>

            <table>
                <thead>
                    <tr>
                        <th>Course Title</th>
                        <th>User Name</th>
                        <th>Expiry Date</th>
                        <th>Time Remaining</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    {expiringCourses.length > 0 ? (
                        expiringCourses.map((course) => {
                            const expiryDate = new Date(course.expiry_date);
                            const timeRemaining = Math.floor(
                                (expiryDate - new Date()) / (1000 * 60 * 60 * 24)
                            ); // in days
                            const status = course.notification_sent ? "Notified" : "Pending Notification";
                            return (
                                <tr key={course.id}>
                                    <td>{course.title}</td>
                                    <td>{course.user_name}</td>
                                    <td>{expiryDate.toLocaleDateString()}</td>
                                    <td>{timeRemaining < 0 ? "Expired" : `${timeRemaining} days`}</td>
                                    <td>{status}</td>
                                </tr>
                            );
                        })
                    ) : (
                        <tr>
                            <td colSpan="5">No expiring courses at the moment.</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default Admin;
