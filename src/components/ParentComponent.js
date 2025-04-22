import React from 'react';
import BuyCourses from './BuyCourses';
import { useAuth } from '../context/AuthContext';

const ParentComponent = () => {
  const { user } = useAuth();
  const userId = user ? user.id : null;

  const handlePurchase = (courseId) => {
    console.log(`Course ${courseId} purchased.`);
    // Here, add the logic for purchasing the course
  };

  return <BuyCourses onPurchase={handlePurchase} userId={userId} />;
};

export default ParentComponent;
