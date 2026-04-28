import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";

// Custom event to notify profile changes
export const PROFILE_UPDATED_EVENT = 'profileUpdated';

export const useProfile = () => {

    function getProfile() {
        try {
            const profile = localStorage.getItem('userProfile');
            return profile ? JSON.parse(profile) : null;
        } catch {
            return null;
        }
    }

    // Checks for saved data in local storage
    const [profile, setProfile] = useState(getProfile);
    const [loadingProfile, setLoadingProfile] = useState(true);

    useEffect(() => {
        const validateProfile = async () => {
            const saved = getProfile();

            if (!saved) {
                setProfile(null);
                setLoadingProfile(false);
                return;
            }

            const { data, error } = await supabase
                .from("users")
                .select("name")
                .eq("name", saved.name)
                .single();

            if (error || !data) {
                localStorage.removeItem("userProfile");
                setProfile(null);
            } else {
                setProfile(saved);
            }

            setLoadingProfile(false);
        };

        validateProfile();
    }, []);

    useEffect(() => {
        const channel = supabase
            .channel("profile-delete-listener")
            .on(
                "postgres_changes",
                {
                    event: "DELETE",
                    schema: "public",
                    table: "users",
                },
                (payload) => {
                    const saved = getProfile();

                    if (!saved) return;

                    // matchar mot name (eftersom ni använder name som id)
                    if (payload.old.name === saved.name) {
                        localStorage.removeItem("userProfile");
                        setProfile(null);
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);


    // Save new data 
    const updateProfile = (newData) => {
        localStorage.setItem('userProfile', JSON.stringify(newData));
        setProfile(newData);

        // Dispatch custom event to let other components know about the change
        window.dispatchEvent(new CustomEvent(PROFILE_UPDATED_EVENT, { detail: newData }));
    };

    return { profile, updateProfile, loadingProfile };
}