import React, { useState, useEffect } from 'react';
import api from '../services/api';

/**
 * DoctorSelectionModal — Triggered when a crisis alert is detected.
 * Fetches 3 nearby doctors based on geolocation and allows user selection.
 */
const DoctorSelectionModal = ({ isOpen, onClose, alertId }) => {
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedId, setSelectedId] = useState(null);
    const [status, setStatus] = useState(null);

    useEffect(() => {
        if (isOpen) {
            fetchNearbyDoctors();
        }
    }, [isOpen]);

    const fetchNearbyDoctors = () => {
        setLoading(true);
        // Get user location
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const { latitude, longitude } = position.coords;
                    try {
                        const response = await api.get(`/doctors/nearby?lat=${latitude}&lon=${longitude}`);
                        setDoctors(response.data.doctors);
                    } catch (err) {
                        console.error("Error fetching nearby doctors:", err);
                        // Fallback: fetch any 3 doctors
                        const response = await api.get('/doctors/nearby');
                        setDoctors(response.data.doctors);
                    } finally {
                        setLoading(false);
                    }
                },
                async (err) => {
                    console.warn("Geolocation denied/failed:", err);
                    // Fallback to general nearby list
                    const response = await api.get('/doctors/nearby');
                    setDoctors(response.data.doctors);
                    setLoading(false);
                }
            );
        } else {
            // Fallback for browsers without geolocation
            api.get('/doctors/nearby').then(res => {
                setDoctors(res.data.doctors);
                setLoading(false);
            });
        }
    };

    const handleSelect = async (doctorId) => {
        setSelectedId(doctorId);
        try {
            await api.post('/doctors/select', {
                doctor_id: doctorId,
                alert_id: alertId
            });
            setStatus({ type: 'success', message: 'Notifications sent. You will receive an email shortly.' });
            setTimeout(() => {
                onClose();
                setStatus(null);
                setSelectedId(null);
            }, 3000);
        } catch (err) {
            setStatus({ type: 'error', message: 'Failed to send notifications. Please try again.' });
            setSelectedId(null);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
            <div className="bg-white dark:bg-gray-900 w-full max-w-2xl rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
                <div className="p-6 border-b border-gray-100 dark:border-gray-800">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Need someone to talk to?</h2>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">We've found professional doctors nearby who can provide immediate support.</p>
                </div>

                <div className="p-6 max-h-[60vh] overflow-y-auto space-y-4">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-12 space-y-4">
                            <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                            <p className="text-gray-500">Finding nearby specialists...</p>
                        </div>
                    ) : doctors.length > 0 ? (
                        doctors.map((doctor) => (
                            <div key={doctor.id} className="group relative bg-gray-50 dark:bg-gray-800/50 p-5 rounded-xl border border-gray-100 dark:border-gray-700 hover:border-indigo-500 transition-all duration-300">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center">
                                            {doctor.name}
                                            <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 rounded-full">
                                                {doctor.specialization}
                                            </span>
                                        </h3>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 font-medium">{doctor.clinic_name}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-0.5">{doctor.address}</p>
                                        {doctor.distance_km && (
                                            <p className="text-xs text-indigo-600 font-bold mt-2">≈ {doctor.distance_km} km away</p>
                                        )}
                                    </div>
                                    <div className="flex flex-col space-y-2">
                                        {doctor.maps_url && (
                                            <a 
                                                href={doctor.maps_url} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="text-xs font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 dark:bg-indigo-900/20 px-3 py-1.5 rounded-lg text-center"
                                            >
                                                View Map
                                            </a>
                                        )}
                                        <button
                                            onClick={() => handleSelect(doctor.id)}
                                            disabled={!!selectedId}
                                            className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${
                                                selectedId === doctor.id 
                                                ? 'bg-green-500 text-white' 
                                                : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md hover:shadow-lg'
                                            }`}
                                        >
                                            {selectedId === doctor.id ? 'Connecting...' : 'Connect'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-8">
                            <p className="text-gray-500">No doctors listed in the database yet.</p>
                        </div>
                    )}

                    {status && (
                        <div className={`p-4 rounded-xl text-sm font-bold animate-in slide-in-from-bottom-2 ${
                            status.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                            {status.message}
                        </div>
                    )}
                </div>

                <div className="p-4 bg-gray-50 dark:bg-gray-800/80 border-t border-gray-100 dark:border-gray-800 flex justify-end items-center">
                    <button 
                        onClick={onClose}
                        className="text-sm font-bold text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 px-4 py-2"
                    >
                        Dismiss
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DoctorSelectionModal;
