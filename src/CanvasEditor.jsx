import { useState } from "react";
import { URLImage } from "./App";
const CanvasEditor = () => {
    const [elements, setElements] = useState([]);
    const [selectedId, setSelectedId] = useState(null);
    const [history, setHistory] = useState([]);
    const [historyStep, setHistoryStep] = useState(-1);
  
    const stageRef = useRef();
  
    const addImage = () => {
      const newElement = {
        id: image-`${Date.now()}`,
        type: 'image',
        src: 'https://konvajs.org/assets/yoda.jpg',
        x: 50,
        y: 50,
        width: 200,
        height: 200,
        rotation: 0,
      };
      const updated = [...elements, newElement];
      setElements(updated);
      saveHistory(updated);
    };
  
    const addText = () => {
      const newText = {
        id: text-`${Date.now()}`,
        type: 'text',
        text: 'Edit Me!',
        x: 100,
        y: 100,
        fontSize: 24,
        draggable: true,
      };
      const updated = [...elements, newText];
      setElements(updated);
      saveHistory(updated);
    };
  
    const saveHistory = (newElements) => {
      const updatedHistory = [...history.slice(0, historyStep + 1), newElements];
      setHistory(updatedHistory);
      setHistoryStep(updatedHistory.length - 1);
    };
  
    const undo = () => {
      if (historyStep <= 0) return;
      setElements(history[historyStep - 1]);
      setHistoryStep(historyStep - 1);
    };
  
    const redo = () => {
      if (historyStep >= history.length - 1) return;
      setElements(history[historyStep + 1]);
      setHistoryStep(historyStep + 1);
    };
  
    const moveText = (direction) => {
      const updated = elements.map((el) => {
        if (el.id === selectedId && el.type === 'text') {
          const delta = 10;
          if (direction === 'up') el.y -= delta;
          if (direction === 'down') el.y += delta;
          if (direction === 'left') el.x -= delta;
          if (direction === 'right') el.x += delta;
        }
        return el;
      });
      setElements(updated);
      saveHistory(updated);
    };
  
    const bringForward = () => {
      const index = elements.findIndex(el => el.id === selectedId);
      if (index < elements.length - 1) {
        const updated = [...elements];
        [updated[index], updated[index + 1]] = [updated[index + 1], updated[index]];
        setElements(updated);
        saveHistory(updated);
      }
    };
  
    const sendBackward = () => {
      const index = elements.findIndex(el => el.id === selectedId);
      if (index > 0) {
        const updated = [...elements];
        [updated[index], updated[index - 1]] = [updated[index - 1], updated[index]];
        setElements(updated);
        saveHistory(updated);
      }
    };
  
    const saveState = () => {
      localStorage.setItem('canvasState', JSON.stringify(elements));
      alert('Canvas state saved!');
    };
  
    const loadState = () => {
      const state = localStorage.getItem('canvasState');
      if (state) {
        const parsed = JSON.parse(state);
        setElements(parsed);
        saveHistory(parsed);
      }
    };
  
    const updateElement = (updatedEl) => {
      const updated = elements.map((el) => (el.id === updatedEl.id ? updatedEl : el));
      setElements(updated);
      saveHistory(updated);
    };
  
    return (
      <div>
        <div className="controls">
          <button onClick={addImage}>Add Image</button>
          <button onClick={addText}>Add Text</button>
          <button onClick={undo}>Undo</button>
          <button onClick={redo}>Redo</button>
          <button onClick={() => moveText('up')}>Up</button>
          <button onClick={() => moveText('down')}>Down</button>
          <button onClick={() => moveText('left')}>Left</button>
          <button onClick={() => moveText('right')}>Right</button>
          <button onClick={bringForward}>Bring Forward</button>
          <button onClick={sendBackward}>Send Backward</button>
          <button onClick={saveState}>Save</button>
          <button onClick={loadState}>Load</button>
        </div>
        <Stage width={window.innerWidth} height={600} ref={stageRef} onMouseDown={() => setSelectedId(null)}>
          <Layer>
            {elements.map((el, i) => {
              if (el.type === 'image') {
                return (
                  <URLImage
                    key={el.id}
                    image={el}
                    isSelected={el.id === selectedId}
                    onSelect={() => setSelectedId(el.id)}
                    onChange={updateElement}
                  />
                );
              } else if (el.type === 'text') {
                return (
                  <Text
                    key={el.id}
                    {...el}
                    onClick={() => setSelectedId(el.id)}
                    onDragEnd={(e) => {
                      updateElement({ ...el, x: e.target.x(), y: e.target.y() });
                    }}
                  />
                );
              }
              return null;
            })}
          </Layer>
        </Stage>
      </div>
    );
  };
  
  export default CanvasEditor;