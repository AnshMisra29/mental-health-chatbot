import React, { useState, useEffect } from 'react';
import { MapPin, ExternalLink, Check, Loader2, ChevronDown } from 'lucide-react';
import api from '../services/api';

/**
 * DoctorSuggestions — Rendered inline in the chat when a crisis is detected.
 * Fetches up to 9 nearby doctors and paginates them 3 at a time.
 */
const DoctorSuggestions = ({ alertId }) => {
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedId, setSelectedId] = useState(null);
    const [status, setStatus] = useState(null);
    const [visibleCount, setVisibleCount] = useState(3);

    useEffect(() => {
        fetchNearbyDoctors();
    }, [alertId]);

    const fetchNearbyDoctors = () => {
        setLoading(true);
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const { latitude, longitude } = position.coords;
                    try {
                        const response = await api.get(`/doctors/nearby?lat=${latitude}&lon=${longitude}`);
                        setDoctors(response.data.doctors);
                    } catch (err) {
                        const response = await api.get('/doctors/nearby');
                        setDoctors(response.data.doctors);
                    } finally {
                        setLoading(false);
                    }
                },
                async () => {
                    const response = await api.get('/doctors/nearby');
                    setDoctors(response.data.doctors);
                    setLoading(false);
                }
            );
        } else {
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
            setStatus({ type: 'success', message: 'Help is on the way. Check your email.' });
        } catch (err) {
            setStatus({ type: 'error', message: 'Failed to connect. Please try again.' });
            setSelectedId(null);
        }
    };

    const handleShowMore = () => {
        setVisibleCount(prev => Math.min(prev + 3, doctors.length));
    };

    if (loading) {
        return (
            <div className="mt-4 p-4 rounded-2xl bg-card border border-border flex items-center gap-3 animate-pulse">
                <Loader2 className="w-5 h-5 text-indigo-500 animate-spin" />
                <span className="text-sm font-medium text-foreground/60">Finding support nearby...</span>
            </div>
        );
    }

    if (doctors.length === 0) return null;

    const visibleDoctors = doctors.slice(0, visibleCount);
    const hasMore = visibleCount < doctors.length;

    return (
        <div className="mt-6 space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-2 px-1">
                <div className="h-px flex-1 bg-border" />
                <span className="text-[10px] font-black uppercase tracking-widest text-foreground/40">
                    Professional Support Options
                </span>
                <div className="h-px flex-1 bg-border" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {visibleDoctors.map((doctor) => (
                    <div 
                        key={doctor.id} 
                        className={`group relative bg-card border ${selectedId === doctor.id ? 'border-emerald-500/50 ring-1 ring-emerald-500/20' : 'border-border'} p-4 rounded-2xl hover:border-indigo-500/50 transition-all duration-300 shadow-sm hover:shadow-md animate-in fade-in zoom-in-95 duration-300`}
                    >
                        <div className="space-y-3">
                            <div>
                                <h4 className="text-xs font-black text-foreground truncate">{doctor.name}</h4>
                                <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-tighter line-clamp-1">
                                    {doctor.specialization}
                                </span>
                            </div>
                            
                            <div className="space-y-1.5">
                                <div className="flex items-start gap-2 text-[10px] text-foreground/60">
                                    <MapPin className="w-3 h-3 mt-0.5 flex-shrink-0" />
                                    <span className="line-clamp-2">{doctor.clinic_name}, {doctor.address}</span>
                                </div>
                                {doctor.distance_km && (
                                    <p className="text-[10px] font-black text-indigo-500/80">
                                        ≈ {doctor.distance_km.toFixed(1)} km away
                                    </p>
                                )}
                            </div>

                            <div className="pt-2 flex gap-2">
                                {doctor.maps_url && (
                                    <a 
                                        href={doctor.maps_url} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-muted text-[10px] font-bold text-foreground/80 hover:bg-border transition-colors border border-border/50"
                                    >
                                        <ExternalLink className="w-3 h-3" />
                                        Map
                                    </a>
                                )}
                                <button
                                    onClick={() => handleSelect(doctor.id)}
                                    disabled={!!selectedId}
                                    className={`flex-[1.5] flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[10px] font-black transition-all ${
                                        selectedId === doctor.id 
                                        ? 'bg-emerald-500 text-white' 
                                        : 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-sm'
                                    }`}
                                >
                                    {selectedId === doctor.id ? (
                                        <><Check className="w-3 h-3" /> Connected</>
                                    ) : (
                                        'Connect'
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Show More Button */}
            {hasMore && (
                <button
                    onClick={handleShowMore}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-border bg-card text-[10px] font-black uppercase tracking-widest text-foreground/50 hover:text-indigo-500 hover:border-indigo-500/40 hover:bg-indigo-500/5 transition-all duration-200"
                >
                    <ChevronDown className="w-3 h-3" />
                    More options
                </button>
            )}

            {status && (
                <div className={`p-3 rounded-xl text-[10px] font-black uppercase tracking-tighter text-center animate-in zoom-in-95 duration-300 ${
                    status.type === 'success' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'
                }`}>
                    {status.message}
                </div>
            )}
        </div>
    );
};

export default DoctorSuggestions;
