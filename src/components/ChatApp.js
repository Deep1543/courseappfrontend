import React, { useState, useEffect } from "react";
import axios from "axios";

function ChatApp() {
    const [messages, setMessages] = useState([]);
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Fetch chat messages from the backend
    useEffect(() => {
        const fetchMessages = async () => {
            try {
                const response = await axios.get("http://localhost:5000/messages");
                setMessages(response.data.messages);
            } catch (err) {
                console.error("Error fetching messages:", err);
                setError("Error fetching messages");
            }
        };

        fetchMessages();
    }, []);

    // Handle sending a new message
    const sendMessage = async () => {
        if (!message.trim()) return; // Prevent empty messages

        setLoading(true);
        try {
            // Send the message to your backend
            const response = await axios.post("http://localhost:5000/webhook", {
                sender: "user", // In real application, get this from user's session or phone number
                message: message,
            });

            // Update the UI with the response message
            setMessages([...messages, { sender: "user", text: message }]);
            setMessage("");
        } catch (err) {
            console.error("Error sending message:", err);
            setError("Error sending message");
        } finally {
            setLoading(false);
        }
    };

    // Handle Enter key press
    const handleKeyPress = (e) => {
        if (e.key === "Enter" && !loading) {
            e.preventDefault();
            sendMessage();
        }
    };

    return (
        <div className="container mx-auto p-4">
            <div className="chat-container bg-white p-4 rounded-lg shadow-lg max-w-xl mx-auto">
                <div className="messages-container h-64 overflow-y-auto p-2 bg-gray-100 rounded-md">
                    {messages.length === 0 ? (
                        <div className="text-center text-gray-500">No messages yet</div>
                    ) : (
                        messages.map((msg, index) => (
                            <div
                                key={index}
                                className={`message p-2 m-2 rounded-md ${
                                    msg.sender === "user" ? "bg-blue-200 text-right" : "bg-gray-300 text-left"
                                }`}
                            >
                                {msg.text}
                            </div>
                        ))
                    )}
                    {loading && <div className="text-center text-gray-500">Thinking...</div>}
                    {error && <div className="text-red-500">{error}</div>}
                </div>

                <div className="input-container mt-2 flex">
                    <input
                        type="text"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyDown={handleKeyPress}
                        className="flex-grow p-2 border rounded-l-lg"
                        placeholder="Type your message"
                    />
                    <button
                        onClick={sendMessage}
                        className="bg-blue-500 text-white p-2 rounded-r-lg"
                        disabled={loading}
                    >
                        Send
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ChatApp;
