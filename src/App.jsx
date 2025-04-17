import React, { useRef, useState, useEffect } from 'react';
import { Stage, Layer, Image as KonvaImage, Text, Transformer } from 'react-konva';
import useImage from 'use-image';

// Image component
const URLImage = ({ image, isSelected, onSelect, onChange }) => {
  const shapeRef = useRef();
  const trRef = useRef();
  const [img] = useImage(image.src);

  useEffect(() => {
    if (isSelected && trRef.current && shapeRef.current) {
      trRef.current.nodes([shapeRef.current]);
      trRef.current.getLayer().batchDraw();
    }
  }, [isSelected]);

  return (
    <>
      <KonvaImage
        image={img}
        x={image.x}
        y={image.y}
        width={image.width}
        height={image.height}
        draggable
        ref={shapeRef}
        rotation={image.rotation}
        onClick={onSelect}
        onTap={onSelect}
        onDragEnd={(e) => {
          onChange({ ...image, x: e.target.x(), y: e.target.y() });
        }}
        onTransformEnd={(e) => {
          const node = shapeRef.current;
          const scaleX = node.scaleX();
          const scaleY = node.scaleY();
          node.scaleX(1);
          node.scaleY(1);
          onChange({
            ...image,
            x: node.x(),
            y: node.y(),
            rotation: node.rotation(),
            width: node.width() * scaleX,
            height: node.height() * scaleY,
          });
        }}
      />
      {isSelected && <Transformer ref={trRef} rotateEnabled={true} />}
    </>
  );
};

// Video component
const VideoElement = ({ videoData, isSelected, onSelect, onChange }) => {
  const shapeRef = useRef();
  const trRef = useRef();
  const videoRef = useRef(document.createElement('video'));

  useEffect(() => {
    const video = videoRef.current;
    video.src = videoData.src;
    video.crossOrigin = 'anonymous';
    video.load();
    video.addEventListener('loadeddata', () => {
      const layer = shapeRef.current.getLayer();
      const anim = () => {
        if (!video.paused && !video.ended) {
          layer.batchDraw();
          requestAnimationFrame(anim);
        }
      };
      anim();
    });
  }, []);

  useEffect(() => {
    if (isSelected && shapeRef.current && trRef.current) {
      trRef.current.nodes([shapeRef.current]);
      trRef.current.getLayer().batchDraw();
    }
  }, [isSelected]);

  return (
    <>
      <KonvaImage
        image={videoRef.current}
        x={videoData.x}
        y={videoData.y}
        width={videoData.width}
        height={videoData.height}
        rotation={videoData.rotation}
        draggable
        ref={shapeRef}
        onClick={onSelect}
        onTap={onSelect}
        onDragEnd={(e) => {
          onChange({ ...videoData, x: e.target.x(), y: e.target.y() });
        }}
        onTransformEnd={(e) => {
          const node = shapeRef.current;
          const scaleX = node.scaleX();
          const scaleY = node.scaleY();
          node.scaleX(1);
          node.scaleY(1);
          onChange({
            ...videoData,
            x: node.x(),
            y: node.y(),
            rotation: node.rotation(),
            width: node.width() * scaleX,
            height: node.height() * scaleY,
          });
        }}
      />
      {isSelected && <Transformer ref={trRef} rotateEnabled={true} />}
      {isSelected && (
        <div style={{ marginTop: 10 }}>
          <button onClick={() => videoRef.current.play()}>Play</button>
          <button onClick={() => videoRef.current.pause()}>Pause</button>
          <button
            onClick={() => {
              videoRef.current.pause();
              videoRef.current.currentTime = 0;
            }}
          >
            Stop
          </button>
        </div>
      )}
    </>
  );
};

// Text component
const ResizableText = ({ textData, isSelected, onSelect, onChange }) => {
  const shapeRef = useRef();
  const trRef = useRef();

  useEffect(() => {
    if (isSelected && shapeRef.current && trRef.current) {
      trRef.current.nodes([shapeRef.current]);
      trRef.current.getLayer().batchDraw();
    }
  }, [isSelected]);

  return (
    <>
      <Text
        {...textData}
        ref={shapeRef}
        draggable
        onClick={onSelect}
        onTap={onSelect}
        onDragEnd={(e) => {
          onChange({ ...textData, x: e.target.x(), y: e.target.y() });
        }}
        onTransformEnd={(e) => {
          const node = shapeRef.current;
          const scaleX = node.scaleX();
          const scaleY = node.scaleY();
          node.scaleX(1);
          node.scaleY(1);
          onChange({
            ...textData,
            x: node.x(),
            y: node.y(),
            width: node.width() * scaleX,
            height: node.height() * scaleY,
            fontSize: textData.fontSize * scaleY,
          });
        }}
      />
      {isSelected && <Transformer ref={trRef} rotateEnabled={true} />}
    </>
  );
};

// Main CanvasEditor
const CanvasEditor = () => {
  const [elements, setElements] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [history, setHistory] = useState([]);
  const [historyStep, setHistoryStep] = useState(-1);
  const stageRef = useRef();

  const addImage = () => {
    const newElement = {
      id: `image-${Date.now()}`,
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
      id: `text-${Date.now()}`,
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

  const addVideo = () => {
    const newVideo = {
      id: `video-${Date.now()}`,
      type: 'video',
      src: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
      x: 100,
      y: 150,
      width: 300,
      height: 200,
      rotation: 0,
    };
    const updated = [...elements, newVideo];
    setElements(updated);
    saveHistory(updated);
  };

  const updateElement = (updatedEl) => {
    const updated = elements.map((el) => (el.id === updatedEl.id ? updatedEl : el));
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

  const moveSelected = (direction) => {
    const updated = elements.map((el) => {
      if (el.id === selectedId) {
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
    if (!selectedId) return;
    const index = elements.findIndex((el) => el.id === selectedId);
    if (index < 0 || index === elements.length - 1) return;
    const updated = [...elements];
    [updated[index], updated[index + 1]] = [updated[index + 1], updated[index]];
    setElements(updated);
    saveHistory(updated);
  };

  const sendBackward = () => {
    if (!selectedId) return;
    const index = elements.findIndex((el) => el.id === selectedId);
    if (index <= 0) return;
    const updated = [...elements];
    [updated[index], updated[index - 1]] = [updated[index - 1], updated[index]];
    setElements(updated);
    saveHistory(updated);
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

  return (
    <div>
      <div className="controls" style={{ marginBottom: 10 }}>
        <button onClick={addImage}>Add Image</button>
        <button onClick={addText}>Add Text</button>
        <button onClick={addVideo}>Add Video</button>
        <button onClick={undo}>Undo</button>
        <button onClick={redo}>Redo</button>
        <button onClick={() => moveSelected('up')}>Up</button>
        <button onClick={() => moveSelected('down')}>Down</button>
        <button onClick={() => moveSelected('left')}>Left</button>
        <button onClick={() => moveSelected('right')}>Right</button>
        <button onClick={bringForward}>Bring Forward</button>
        <button onClick={sendBackward}>Send Backward</button>
        <button onClick={saveState}>Save</button>
        <button onClick={loadState}>Load</button>
      </div>

      <Stage
        width={window.innerWidth}
        height={window.innerHeight}
        ref={stageRef}
        onMouseDown={(e) => {
          const clickedOnEmpty = e.target === e.target.getStage();
          if (clickedOnEmpty) setSelectedId(null);
        }}
      >
        <Layer>
      {elements.map((el) => {
        const isSelected = el.id === selectedId;
        const onSelect = () => setSelectedId(el.id);
        const onChange = (newAttrs) => updateElement(newAttrs);

        if (el.type === 'image') {
          return (
            <URLImage
              key={el.id}
              image={el}
              isSelected={isSelected}
              onSelect={onSelect}
              onChange={onChange}
            />
          );
        } else if (el.type === 'video') {
          return (
            <VideoElement
              key={el.id}
              videoData={el}
              isSelected={isSelected}
              onSelect={onSelect}
              onChange={onChange}
            />
          );
        } else if (el.type === 'text') {
          return (
            <ResizableText
              key={el.id}
              textData={el}
              isSelected={isSelected}
              onSelect={onSelect}
              onChange={onChange}
            />
          );
        } else {
          return null;
        }
      })}
    </Layer>

      </Stage>
    </div>
  );
};

export default CanvasEditor;
