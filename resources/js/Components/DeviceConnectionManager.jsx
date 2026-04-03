import React, { useState } from 'react';
import PrimaryButton from '@/Components/PrimaryButton';

export default function DeviceConnectionManager({ deviceId, onSync }) {
    const [status, setStatus] = useState("Disconnected");

    const connectSerial = async () => {
        try {
            if (!('serial' in navigator)) {
                setStatus("Error: USB Serial not supported in this browser.");
                return;
            }
            const port = await navigator.serial.requestPort();
            await port.open({ baudRate: 115200 });
            setStatus("Connected via USB");
            // Simulate reading/writing thread
        } catch (error) {
            console.error(error);
            setStatus("Error: " + error.message);
        }
    };

    const connectBluetooth = async () => {
        try {
            if (!('bluetooth' in navigator)) {
                setStatus("Error: Bluetooth not supported.");
                return;
            }
            const device = await navigator.bluetooth.requestDevice({
                acceptAllDevices: true,
                optionalServices: ['generic_access']
            });
            await device.gatt.connect();
            setStatus("Connected via Bluetooth");
        } catch (error) {
            console.error(error);
            setStatus("Error: " + error.message);
        }
    };

    const connectWebSocket = async () => {
        setStatus("Connected via Cloud");
    };

    return (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
            <h4 className="text-sm font-semibold mb-3 text-gray-700">Direct Connect</h4>
            <div className="flex gap-2">
                <button 
                    onClick={connectSerial}
                    className="flex-1 bg-white border border-gray-300 text-gray-700 py-2 rounded-md font-medium text-xs hover:bg-gray-100 transition"
                >
                    🔌 USB (Serial)
                </button>
                <button 
                    onClick={connectBluetooth}
                    className="flex-1 bg-white border border-blue-300 text-blue-700 py-2 rounded-md font-medium text-xs hover:bg-blue-50 transition"
                >
                    🦷 Bluetooth
                </button>
                <button 
                    onClick={connectWebSocket}
                    className="flex-1 bg-white border border-emerald-300 text-emerald-700 py-2 rounded-md font-medium text-xs hover:bg-emerald-50 transition"
                >
                    ☁️ Cloud Sync
                </button>
            </div>
            {status !== "Disconnected" && (
                <div className={`mt-3 text-xs font-mono p-2 rounded break-words ${status.includes('Error') ? 'bg-red-900 text-red-200' : 'bg-black text-green-400'}`}>
                    Status: {status}
                </div>
            )}
        </div>
    );
}
