import React, { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import PrimaryButton from '@/Components/PrimaryButton';
import DeviceConnectionManager from '@/Components/DeviceConnectionManager';

export default function Editor({ auth }) {
    const [color, setColor] = useState('#ff0000');
    const [tool, setTool] = useState('brush'); // brush or fill
    const [frames, setFrames] = useState([{ id: 1, data: new Array(64).fill('#000000') }]);
    const [currentFrame, setCurrentFrame] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [fps, setFps] = useState(10);
    const [prompt, setPrompt] = useState("");
    const [aiResponse, setAiResponse] = useState("");
    const [isDrawing, setIsDrawing] = useState(false);

    // Playback effect
    useEffect(() => {
        let interval;
        if (isPlaying) {
            interval = setInterval(() => {
                setCurrentFrame((prev) => (prev + 1) % frames.length);
            }, 1000 / fps);
        }
        return () => clearInterval(interval);
    }, [isPlaying, frames, fps]);

    const floodFill = (index, targetColor, replacementColor, data) => {
        if (targetColor === replacementColor) return data;
        if (data[index] !== targetColor) return data;
        
        let stack = [index];
        let newData = [...data];

        while(stack.length > 0) {
            let curr = stack.pop();
            if (newData[curr] === targetColor) {
                newData[curr] = replacementColor;
                // Add neighbors (8x8 grid)
                const x = curr % 8;
                const y = Math.floor(curr / 8);
                if (x > 0) stack.push(curr - 1); // left
                if (x < 7) stack.push(curr + 1); // right
                if (y > 0) stack.push(curr - 8); // up
                if (y < 7) stack.push(curr + 8); // down
            }
        }
        return newData;
    };

    const handlePixelAction = (index) => {
        const newFrames = [...frames];
        let newFrameData = [...newFrames[currentFrame].data];
        
        if (tool === 'brush') {
            newFrameData[index] = color;
        } else if (tool === 'eraser') {
            newFrameData[index] = '#000000';
        } else if (tool === 'fill') {
            newFrameData = floodFill(index, newFrameData[index], color, newFrameData);
        }
        
        newFrames[currentFrame].data = newFrameData;
        setFrames(newFrames);
    };

    const applyPreset = (preset) => {
        const newFrameData = new Array(64).fill('#000000');
        if (preset === 'rainbow') { // simple diagonal logic
            const colors = ['#ff0000', '#ff7f00', '#ffff00', '#00ff00', '#0000ff', '#4b0082', '#9400d3'];
            for(let i=0; i<64; i++) {
                newFrameData[i] = colors[(i % 8 + Math.floor(i/8)) % colors.length];
            }
        } else if (preset === 'color_wipe') {
            for(let i=0; i<64; i++) newFrameData[i] = color;
        }
        
        const newFrames = [...frames];
        newFrames[currentFrame].data = newFrameData;
        setFrames(newFrames);
    };

    const handlePromptAnalyze = async () => {
        if(!prompt) return;
        setAiResponse("Analyzing prompt...");
        try {
            const res = await fetch('/api/devices/1/prompt', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content')
                },
                body: JSON.stringify({ prompt })
            });
            const data = await res.json();
            setAiResponse('AI Output: ' + JSON.stringify(data.animation));
        } catch(e) {
            setAiResponse('Mock: Generated pattern based on prompt.');
            applyPreset('rainbow');
        }
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">NeoPixel Studio / Editor</h2>}
        >
            <Head title="Animation Editor" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 flex flex-col lg:flex-row gap-6">
                    
                    {/* Main Canvas Area */}
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg flex-1 border border-gray-200">
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
                                <h3 className="text-xl font-black text-gray-900 tracking-tight">LED Canvas</h3>
                                <div className="flex gap-4 items-center bg-gray-50 p-2 rounded-lg border border-gray-200">
                                    <div className="flex gap-1 bg-white p-1 rounded border shadow-sm">
                                        <button 
                                            onClick={() => setTool('brush')} 
                                            className={`px-3 py-1 text-sm font-semibold rounded ${tool === 'brush' ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                                        >🖌 Brush</button>
                                        <button 
                                            onClick={() => setTool('fill')} 
                                            className={`px-3 py-1 text-sm font-semibold rounded ${tool === 'fill' ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                                        >🪣 Fill</button>
                                        <button 
                                            onClick={() => setTool('eraser')} 
                                            className={`px-3 py-1 text-sm font-semibold rounded ${tool === 'eraser' ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                                        >🧽 Eraser</button>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <input 
                                            type="color" 
                                            value={color} 
                                            onChange={(e) => setColor(e.target.value)} 
                                            className="w-10 h-10 p-0 border-0 rounded-full overflow-hidden cursor-pointer shadow-sm"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Live Simulation Engine */}
                            <div className="text-center font-bold text-gray-500 uppercase tracking-widest text-xs mb-2">Live Canvas Simulation Preview</div>
                            <div 
                                className="grid grid-cols-8 gap-1 w-full max-w-md mx-auto aspect-square bg-gray-900 p-3 rounded-2xl shadow-xl border-4 border-gray-800"
                                onMouseLeave={() => setIsDrawing(false)}
                                onMouseUp={() => setIsDrawing(false)}
                            >
                                {frames[currentFrame]?.data.map((pixelColor, index) => (
                                    <div
                                        key={index}
                                        onMouseDown={() => { setIsDrawing(true); handlePixelAction(index); }}
                                        onMouseEnter={() => { if(isDrawing) handlePixelAction(index); }}
                                        className="w-full h-full rounded shadow hover:scale-105 transition-transform"
                                        style={{ 
                                            backgroundColor: pixelColor,
                                            boxShadow: pixelColor !== '#000000' ? `0 0 12px ${pixelColor}` : 'inset 0 2px 4px rgba(0,0,0,0.5)'
                                        }}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Timeline & Playback */}
                        <div className="p-6 bg-gray-50">
                            <div className="flex items-center justify-between gap-4 mb-4">
                                <div className="flex items-center gap-3">
                                    <button 
                                        onClick={() => setIsPlaying(!isPlaying)}
                                        className="w-12 h-12 flex items-center justify-center bg-indigo-600 text-white rounded-full shadow hover:bg-indigo-700 transition"
                                    >
                                        {isPlaying ? '⏸' : '▶️'}
                                    </button>
                                    <div>
                                        <div className="text-sm font-bold text-gray-800">Frame {currentFrame + 1}/{frames.length}</div>
                                        <div className="text-xs text-gray-500">Loop: On</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 bg-white p-2 rounded-lg shadow-sm border border-gray-200">
                                    <span className="text-xs font-bold text-gray-500 uppercase">FPS ({fps})</span>
                                    <input 
                                        type="range" min="1" max="60" 
                                        value={fps} onChange={(e) => setFps(e.target.value)} 
                                        className="w-24 accent-indigo-600"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3 overflow-x-auto pb-4">
                                {frames.map((frame, idx) => (
                                    <div 
                                        key={frame.id} 
                                        onClick={() => setCurrentFrame(idx)}
                                        className={`w-20 h-20 flex-shrink-0 cursor-pointer rounded-xl border-4 overflow-hidden shadow-sm transition-all hover:scale-105 ${currentFrame === idx ? 'border-indigo-500 ring-2 ring-indigo-200' : 'border-gray-200'}`}
                                        style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: '1px', padding: '2px', backgroundColor: '#333' }}
                                    >
                                        {frame.data.map((c, i) => <div key={i} style={{backgroundColor: c}}></div>)}
                                    </div>
                                ))}
                                <button 
                                    onClick={() => {
                                        setFrames([...frames, { id: frames.length + 1, data: [...frames[currentFrame].data] }]);
                                        setCurrentFrame(frames.length);
                                    }}
                                    className="w-20 h-20 flex-shrink-0 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-xl text-gray-400 hover:text-indigo-500 hover:border-indigo-500 hover:bg-white transition-all font-black text-xl bg-gray-100"
                                    title="Duplicate Frame"
                                >
                                    +
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar / AI Prompt & Settings */}
                    <div className="w-full lg:w-96 flex flex-col gap-6">
                        <DeviceConnectionManager deviceId={1} />

                        <div className="bg-white shadow-sm sm:rounded-lg p-6 border border-gray-200">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-bold text-gray-900 bg-gradient-to-r from-purple-500 to-indigo-500 bg-clip-text text-transparent">AI Scene Generator</h3>
                                <button className="text-xl p-1 bg-gray-100 rounded-full hover:bg-indigo-100 transition" title="Voice Control" onClick={() => alert('Listening for voice commands...')}>🎙️</button>
                            </div>
                            <textarea 
                                className="w-full border-gray-200 focus:border-indigo-500 focus:ring-indigo-500 rounded-lg shadow-sm resize-none text-sm p-3" 
                                rows="3" 
                                placeholder="Describe your animation... (e.g. A pulsing rainbow wave)"
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                            ></textarea>
                            <button 
                                onClick={handlePromptAnalyze}
                                className="mt-3 w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white flex items-center justify-center gap-2 py-2.5 rounded-lg font-bold shadow-md hover:shadow-lg transition-all"
                            >
                                <span>✨</span> Generate Magic
                            </button>
                            
                            {aiResponse && (
                                <div className="mt-4 p-3 bg-indigo-50 rounded-lg text-xs leading-relaxed text-indigo-800 border border-indigo-100 font-mono">
                                    {aiResponse}
                                </div>
                            )}
                        </div>

                        <div className="bg-white shadow-sm sm:rounded-lg p-6 border border-gray-200 flex-1">
                            <h4 className="font-bold text-gray-700 mb-3">Built-in Presets</h4>
                            <div className="grid grid-cols-2 gap-2 mb-6">
                                <button onClick={() => applyPreset('rainbow')} className="bg-gray-50 border border-gray-200 text-sm font-medium py-2 rounded-md hover:bg-gray-100 transition">🌈 Rainbow</button>
                                <button onClick={() => applyPreset('color_wipe')} className="bg-gray-50 border border-gray-200 text-sm font-medium py-2 rounded-md hover:bg-gray-100 transition">🧹 Solid Wipe</button>
                                <button className="bg-gray-50 border border-gray-200 text-sm font-medium py-2 rounded-md hover:bg-gray-100 transition">🔥 Fire</button>
                                <button className="bg-gray-50 border border-gray-200 text-sm font-medium py-2 rounded-md hover:bg-gray-100 transition">🌊 Wave</button>
                            </div>
                            
                            <hr className="my-4 border-gray-200"/>

                            <div className="flex gap-2 mb-2">
                                <PrimaryButton className="w-1/2 justify-center">Export</PrimaryButton>
                                <PrimaryButton className="w-1/2 justify-center bg-green-600 hover:bg-green-700">Backup</PrimaryButton>
                            </div>
                            <button className="w-full border border-gray-800 text-gray-800 py-2 rounded-md font-bold uppercase text-xs tracking-wider hover:bg-gray-800 hover:text-white transition">Full Sync to Device</button>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
