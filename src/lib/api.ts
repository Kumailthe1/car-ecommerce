/**
 * API Configuration for Easy Buy platform
 * Pointing to the cPanel hosted backend: tesla.alpha10-world.com.ng
 */

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://tesla.alpha10-world.com.ng";

export const ENDPOINTS = {
    ACTION: `${API_BASE_URL}/serverAction.php`,
    CONTROLLER: `${API_BASE_URL}/serverController.php`,
};

export async function apiRequest(endpoint: string, data: any, isMultipart = false) {
    try {
        const options: RequestInit = {
            method: 'POST',
        };

        if (isMultipart) {
            // For file uploads (receipts), data should be FormData
            options.body = data;
        } else {
            options.headers = {
                'Content-Type': 'application/json',
            };
            options.body = JSON.stringify(data);
        }

        const response = await fetch(endpoint, options);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error("API Request Failed:", error);
        throw error;
    }
}
