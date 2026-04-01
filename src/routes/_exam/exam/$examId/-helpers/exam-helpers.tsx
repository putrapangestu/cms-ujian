import { useCallback } from "react";


export const handleUserCheating = useCallback(() => {
    alert("Peringatan! Anda terdeteksi meninggalkan halaman ujian. Percobaan ini akan dicatat.");
    
    console.log("User blurred the window at:", new Date().toLocaleTimeString());
}, []);