import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Dashboard = () => {
    const [purchases, setPurchases] = useState([]);

    useEffect(() => {
        const token = localStorage.getItem('token');
        axios.get('http://localhost:5000/purchases', {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then((response) => setPurchases(response.data))
            .catch((error) => console.error(error));
    }, []);

    return (
        <div className="container mx-auto mt-10">
            <h2 className="text-3xl font-bold text-center mb-6">My Purchases</h2>
            <div className="bg-gray-100 p-4 rounded shadow">
                {purchases.length > 0 ? (
                    <ul>
                        {purchases.map((purchase) => (
                            <li key={purchase.id} className="mb-4">
                                <p>Course ID: {purchase.course_id}</p>
                                <p>Start Date: {purchase.start_date}</p>
                                <p>End Date: {purchase.end_date || 'Lifetime Access'}</p>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>No purchases found.</p>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
