import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import PrimaryButton from '@/Components/PrimaryButton';
import DeviceConnectionManager from '@/Components/DeviceConnectionManager';

export default function Editor({ auth }) {
    const [gridSize, setGridSize] = useState(32); // Default to 32x32 as requested
    const [color, setColor] = useState('#ff0000');
    const [tool, setTool] = useState('brush'); // brush or fill
    const [frames, setFrames] = useState([{ id: 1, data: new Array(32 * 32).fill('#000000') }]);
    const [currentFrame, setCurrentFrame] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [fps, setFps] = useState(10);
    const [prompt, setPrompt] = useState("");
    const [aiResponse, setAiResponse] = useState("");
    const [isDrawing, setIsDrawing] = useState(false);
    const [activePreset, setActivePreset] = useState(null);

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

    // Handle grid size change manually
    const handleGridChange = (size) => {
        setGridSize(size);
        setFrames([{ id: 1, data: new Array(size * size).fill('#000000') }]);
        setCurrentFrame(0);
        setActivePreset(null);
    };

    const floodFill = (index, targetColor, replacementColor, data) => {
        if (targetColor === replacementColor) return data;
        if (data[index] !== targetColor) return data;
        
        let stack = [index];
        let newData = [...data];

        while(stack.length > 0) {
            let curr = stack.pop();
            if (newData[curr] === targetColor) {
                newData[curr] = replacementColor;
                // Add neighbors
                const x = curr % gridSize;
                const y = Math.floor(curr / gridSize);
                if (x > 0) stack.push(curr - 1); // left
                if (x < gridSize - 1) stack.push(curr + 1); // right
                if (y > 0) stack.push(curr - gridSize); // up
                if (y < gridSize - 1) stack.push(curr + gridSize); // down
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
        if (activePreset === preset) {
            // Remove preset
            setActivePreset(null);
            const newFrames = [...frames];
            newFrames[currentFrame].data = new Array(64).fill('#000000');
            setFrames(newFrames);
            return;
        }

        setActivePreset(preset);
        const totalPixels = gridSize * gridSize;
        let newFrameData = new Array(totalPixels).fill('#000000');
        
        if (preset === 'rainbow') { // diagonal logic
            const colors = ['#ff0000', '#ff7f00', '#ffff00', '#00ff00', '#0000ff', '#4b0082', '#9400d3'];
            for(let i=0; i<totalPixels; i++) {
                newFrameData[i] = colors[(i % gridSize + Math.floor(i/gridSize)) % colors.length];
            }
        } else if (preset === 'color_wipe') {
            for(let i=0; i<totalPixels; i++) newFrameData[i] = color;
        } else if (preset === 'fire') {
            return handlePromptAnalyze('fire');
        } else if (preset === 'wave') {
            return handlePromptAnalyze('wave');
        } else if (preset === 'clear') {
            setActivePreset(null);
        }
        
        const newFrames = [...frames];
        newFrames[currentFrame].data = newFrameData;
        setFrames(newFrames);
    };

    const handlePromptAnalyze = async (text = prompt) => {
        if(!text) return;
        setAiResponse("Analyzing prompt...");
        try {
            const r = await axios.post(`/api/prompt`, { prompt: text, size: gridSize });
            const data = r.data;
            if (data.animation) {
                // If the backend returns 8x8 but we are 32x32, just map it or replace frame size.
                // For simplicity, we just set the frames, which might briefly alter grid view,
                // but usually the backend should obey "size" if implemented.
                if (data.animation.frames[0].data.length !== gridSize * gridSize) {
                    setGridSize(Math.sqrt(data.animation.frames[0].data.length));
                }
                setTimeout(() => setFrames(data.animation.frames), 0);
                setFps(data.animation.fps || 10);
                setCurrentFrame(0);
                setActivePreset(null);
                setAiResponse('AI Output Applied: ' + (text.length > 20 ? text.substring(0,20)+'...' : text));
            }
        } catch(e) {
            console.error(e);
            setAiResponse('Error generating prompt.');
        }
    };

    const handleVoiceControl = () => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) return alert("Speech recognition not supported.");
        
        const rec = new SpeechRecognition();
        rec.onstart = () => setAiResponse("Listening...");
        rec.onresult = (e) => {
            const transcript = e.results[0][0].transcript;
            setPrompt(transcript);
            handlePromptAnalyze(transcript);
        };
        rec.start();
    };

    const handleBackup = () => {
        const data = JSON.stringify({ frames, fps });
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `neopixel-backup-${Date.now()}.json`;
        a.click();
    };

    const handleRestore = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                if (data.frames) setFrames(data.frames);
                if (data.fps) setFps(data.fps);
                setCurrentFrame(0);
                alert("Backup Restored Successfully!");
            } catch(e) { alert("Invalid backup file."); }
        };
        reader.readAsText(file);
    };

    const handleFullSync = async () => {
        const devId = 1; // Default
        try {
            await fetch(`/api/devices/${devId}/control`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content')
                },
                body: JSON.stringify({ command: { frames, fps, loop: true } }),
                credentials: 'include'
            });
            alert("Animation Synced to Device!");
        } catch(e) { alert("Sync failed."); }
    };

    const handleExport = () => {
        handleBackup();
    };

    const handleSaveToCloud = async () => {
        const name = prompt("Enter a name for this animation:", "My Animation");
        if (!name) return;

        try {
            const payload = {
                name,
                fps,
                loop: true,
                frames: frames.map((f, i) => ({
                    order: i + 1,
                    duration: 1000 / fps,
                    data: f.data
                }))
            };
            const r = await axios.post('/api/animations', payload);
            alert("Saved to cloud successfully!");
        } catch (e) {
            console.error(e);
            alert("Failed to save to cloud.");
        }
    };

    const deleteFrame = (idx, e) => {
        e.stopPropagation();
        if (frames.length <= 1) return alert("Cannot delete the last frame!");
        const newFrames = frames.filter((_, i) => i !== idx);
        setFrames(newFrames);
        if (currentFrame >= newFrames.length) setCurrentFrame(Math.max(0, newFrames.length - 1));
    };

    const moveFrame = (idx, direction, e) => {
        e.stopPropagation();
        if (direction === -1 && idx === 0) return;
        if (direction === 1 && idx === frames.length - 1) return;
        
        const newFrames = [...frames];
        const temp = newFrames[idx];
        newFrames[idx] = newFrames[idx + direction];
        newFrames[idx + direction] = temp;
        
        setFrames(newFrames);
        setCurrentFrame(idx + direction);
    };

    const canvasRef = useRef(null);

    // Canvas rendering engine
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d', { alpha: false });
        
        const res = 512; // Internal resolution
        const pixelW = res / gridSize;
        
        ctx.fillStyle = '#111827';
        ctx.fillRect(0, 0, res, res);

        const frameData = frames[currentFrame]?.data || [];
        
        for (let i = 0; i < frameData.length; i++) {
            const x = i % gridSize;
            const y = Math.floor(i / gridSize);
            const c = frameData[i];
            
            if (c !== '#000000') {
                if (gridSize <= 32) {
                    // Render styled circular LEDs for smaller matrices
                    ctx.beginPath();
                    ctx.fillStyle = c;
                    ctx.arc(
                        x * pixelW + pixelW/2, 
                        y * pixelW + pixelW/2, 
                        pixelW/2 * 0.8, 
                        0, Math.PI * 2
                    );
                    ctx.fill();
                } else {
                    // Render high-performance sharp blocks for massive matrices (64x64, 128x128)
                    ctx.fillStyle = c;
                    ctx.fillRect(x * pixelW, y * pixelW, pixelW, pixelW);
                }
            }
        }
    }, [frames, currentFrame, gridSize]);

    const handleCanvasInteraction = (e) => {
        if (!isDrawing && e.type !== 'mousedown') return;
        
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        
        const x = Math.floor((e.clientX - rect.left) / rect.width * gridSize);
        const y = Math.floor((e.clientY - rect.top) / rect.height * gridSize);
        
        if (x < 0 || x >= gridSize || y < 0 || y >= gridSize) return;
        
        const index = y * gridSize + x;
        handlePixelAction(index);
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">NeoPixel Studio / Editor</h2>}
        >
            <Head title="Animation Editor" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 flex flex-col lg:flex-row gap-6">
                    
                    {/* Main Canvas Area */}
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg flex-1 border border-gray-200 dark:border-gray-700">
                        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                            <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
                                <h3 className="text-xl font-black text-gray-900 dark:text-gray-100 tracking-tight">LED Canvas</h3>
                                <div className="flex gap-4 items-center bg-gray-50 dark:bg-gray-900 p-2 rounded-lg border border-gray-200 dark:border-gray-600">
                                    <div className="flex gap-1 bg-white dark:bg-gray-800 p-1 rounded border dark:border-gray-600 shadow-sm">
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
                                            className={`px-3 py-1 text-sm font-semibold rounded ${tool === 'eraser' ? 'bg-indigo-600 text-white' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                                        >🧽 Eraser</button>
                                        <button 
                                            onClick={() => applyPreset('clear')} 
                                            className="px-3 py-1 text-sm font-semibold rounded text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30"
                                        >🗑️ Clear</button>
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
                            <div className="flex justify-between items-center mb-2">
                                <span className="font-bold text-gray-500 uppercase tracking-widest text-xs">Live Canvas Simulation Preview</span>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold text-gray-500">CANVAS METRICS:</span>
                                    <select 
                                        className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded px-2 py-1 font-bold outline-none cursor-pointer"
                                        value={gridSize}
                                        onChange={(e) => handleGridChange(Number(e.target.value))}
                                    >
                                        <option value={8}>8x8 Canvas (Pixel Art)</option>
                                        <option value={16}>16x16 Canvas</option>
                                        <option value={32}>32x32 Canvas (Balanced)</option>
                                        <option value={64}>64x64 Canvas</option>
                                        <option value={128}>128x128 Canvas (Ultra HD)</option>
                                    </select>
                                </div>
                            </div>
                            <div className="flex justify-center w-full">
                                <canvas
                                    ref={canvasRef}
                                    width={512}
                                    height={512}
                                    className="w-full max-w-2xl aspect-square bg-gray-900 rounded-2xl shadow-xl border-4 border-gray-800 cursor-crosshair touch-none"
                                    style={{ imageRendering: 'pixelated' }}
                                    onMouseDown={(e) => { setIsDrawing(true); handleCanvasInteraction(e); }}
                                    onMouseMove={(e) => handleCanvasInteraction(e)}
                                    onMouseUp={() => setIsDrawing(false)}
                                    onMouseLeave={() => setIsDrawing(false)}
                                />
                            </div>
                        </div>

                        {/* Timeline & Playback */}
                        <div className="p-6 bg-gray-50 dark:bg-gray-900">
                            <div className="flex items-center justify-between gap-4 mb-4">
                                <div className="flex items-center gap-3">
                                    <button 
                                        onClick={() => setIsPlaying(!isPlaying)}
                                        className="w-12 h-12 flex items-center justify-center bg-indigo-600 text-white rounded-full shadow hover:bg-indigo-700 transition"
                                    >
                                        {isPlaying ? '⏸' : '▶️'}
                                    </button>
                                    <div>
                                        <div className="text-sm font-bold text-gray-800 dark:text-gray-200">Frame {currentFrame + 1}/{frames.length}</div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400">Loop: On</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 bg-white dark:bg-gray-800 p-2 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                                    <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">FPS ({fps})</span>
                                    <input 
                                        type="range" min="1" max="60" 
                                        value={fps} onChange={(e) => setFps(e.target.value)} 
                                        className="w-24 accent-indigo-600"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3 overflow-x-auto pb-4">
                                {frames.map((frame, idx) => (
                                    <div key={frame.id} className="flex flex-col items-center gap-1 shrink-0">
                                        <div 
                                            onClick={() => setCurrentFrame(idx)}
                                            className={`w-20 h-20 cursor-pointer rounded-xl border-4 overflow-hidden shadow-sm transition-all hover:scale-105 ${currentFrame === idx ? 'border-indigo-500 ring-2 ring-indigo-200 dark:ring-indigo-800' : 'border-gray-200 dark:border-gray-700'}`}
                                            style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: '1px', padding: '2px', backgroundColor: '#333' }}
                                        >
                                            {frame.data.map((c, i) => <div key={i} style={{backgroundColor: c}}></div>)}
                                        </div>
                                        <div className="flex items-center justify-between w-full px-1 text-xs text-gray-500 dark:text-gray-400">
                                            <button onClick={(e) => moveFrame(idx, -1, e)} className="hover:text-indigo-500 disabled:opacity-30" disabled={idx === 0}>◀</button>
                                            <button onClick={(e) => deleteFrame(idx, e)} className="hover:text-red-500">✕</button>
                                            <button onClick={(e) => moveFrame(idx, 1, e)} className="hover:text-indigo-500 disabled:opacity-30" disabled={idx === frames.length - 1}>▶</button>
                                        </div>
                                    </div>
                                ))}
                                <div className="flex flex-col items-center shrink-0">
                                    <button 
                                        onClick={() => {
                                            setFrames([...frames, { id: Date.now(), data: [...frames[currentFrame].data] }]);
                                            setCurrentFrame(frames.length);
                                        }}
                                        className="w-20 h-20 flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl text-gray-400 dark:text-gray-500 hover:text-indigo-500 hover:border-indigo-500 dark:hover:text-indigo-400 dark:hover:border-indigo-400 hover:bg-white dark:hover:bg-gray-800 transition-all font-black text-xl bg-gray-100 dark:bg-gray-900"
                                        title="Duplicate Frame"
                                    >
                                        +
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar / AI Prompt & Settings */}
                    <div className="w-full lg:w-96 flex flex-col gap-6">
                        <DeviceConnectionManager deviceId={1} />

                        <div className="bg-white dark:bg-gray-800 shadow-sm sm:rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 bg-gradient-to-r from-purple-500 to-indigo-500 bg-clip-text text-transparent">AI Scene Generator</h3>
                                <button className="text-xl p-1 bg-gray-100 dark:bg-gray-700 rounded-full hover:bg-indigo-100 dark:hover:bg-indigo-900 transition" 
                                    title="Voice Control" onClick={handleVoiceControl}>🎙️</button>
                            </div>
                            <textarea 
                                className="w-full border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:border-indigo-500 focus:ring-indigo-500 rounded-lg shadow-sm resize-none text-sm p-3" 
                                rows="3" 
                                placeholder="Describe your animation... (e.g. pulsing rainbow wave)"
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                            ></textarea>
                            <button 
                                onClick={() => handlePromptAnalyze()}
                                className="mt-3 w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white flex items-center justify-center gap-2 py-2.5 rounded-lg font-bold shadow-md hover:shadow-lg transition-all"
                            >
                                <span>✨</span> Generate
                            </button>
                            
                            {aiResponse && (
                                <div className="mt-4 p-3 bg-indigo-50 rounded-lg text-xs leading-relaxed text-indigo-800 border border-indigo-100 font-mono">
                                    {aiResponse}
                                </div>
                            )}
                        </div>

                        <div className="bg-white dark:bg-gray-800 shadow-sm sm:rounded-lg p-6 border border-gray-200 dark:border-gray-700 flex-1">
                            <h4 className="font-bold text-gray-700 dark:text-gray-200 mb-3">Presets</h4>
                            <div className="grid grid-cols-2 gap-2 mb-6">
                                <button onClick={() => applyPreset('rainbow')} className={`border text-sm font-medium py-2 rounded-md transition ${activePreset === 'rainbow' ? 'bg-indigo-100 border-indigo-400 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-200 dark:border-indigo-500' : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'}`}>🌈 Rainbow</button>
                                <button onClick={() => applyPreset('color_wipe')} className={`border text-sm font-medium py-2 rounded-md transition ${activePreset === 'color_wipe' ? 'bg-indigo-100 border-indigo-400 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-200 dark:border-indigo-500' : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'}`}>🧹 Solid Wipe</button>
                                <button onClick={() => applyPreset('fire')} className={`border text-sm font-medium py-2 rounded-md transition ${activePreset === 'fire' ? 'bg-indigo-100 border-indigo-400 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-200 dark:border-indigo-500' : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'}`}>🔥 Fire</button>
                                <button onClick={() => applyPreset('wave')} className={`border text-sm font-medium py-2 rounded-md transition ${activePreset === 'wave' ? 'bg-indigo-100 border-indigo-400 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-200 dark:border-indigo-500' : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'}`}>🌊 Wave</button>
                            </div>
                            
                            <hr className="my-4 border-gray-200 dark:border-gray-700"/>

                            <div className="flex gap-2 mb-2">
                                <PrimaryButton className="w-1/3 justify-center" onClick={handleExport}>Local Export</PrimaryButton>
                                <PrimaryButton className="w-1/3 justify-center bg-indigo-600 hover:bg-indigo-700" onClick={handleSaveToCloud}>Save Cloud</PrimaryButton>
                                <PrimaryButton className="w-1/3 justify-center bg-green-600 hover:bg-green-700" onClick={() => document.getElementById('restore-file').click()}>Restore</PrimaryButton>
                                <input type="file" id="restore-file" className="hidden" accept=".json" onChange={handleRestore} />
                            </div>
                            <button onClick={handleFullSync}
                                className="w-full border border-gray-800 text-gray-800 dark:text-gray-300 dark:border-gray-500 py-2 rounded-md font-bold uppercase text-xs tracking-wider hover:bg-gray-800 hover:text-white dark:hover:bg-gray-500 transition">
                                Full Sync to Device
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
