import React from 'react';

const Footer = () => {
    const currentYear = new Date().getFullYear(); // Get the current year

    return (
        <footer className="bg-gray-800 text-white text-center p-4 mt-10">
            <p>&copy; {currentYear} Course App. All rights reserved.</p>
        </footer>
    );
};

export default Footer;
