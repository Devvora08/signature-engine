'use client';

import { Rnd } from 'react-rnd';

export default function DraggableField({ field, onUpdate, onDelete }) {
  const getFieldStyle = () => {
    const baseStyle = 'border-2 flex items-center justify-center text-xs font-semibold';

    switch (field.type) {
      case 'text':
        return `${baseStyle} border-blue-500 bg-blue-50`;
      case 'signature':
        return `${baseStyle} border-green-500 bg-green-50`;
      case 'image':
        return `${baseStyle} border-purple-500 bg-purple-50`;
      case 'date':
        return `${baseStyle} border-orange-500 bg-orange-50`;
      case 'radio':
        return `${baseStyle} border-red-500 bg-red-50`;
      default:
        return `${baseStyle} border-gray-500 bg-gray-50`;
    }
  };

  const getFieldLabel = () => {
    switch (field.type) {
      case 'text':
        return 'TEXT';
      case 'signature':
        return 'SIGNATURE';
      case 'image':
        return 'IMAGE';
      case 'date':
        return 'DATE';
      case 'radio':
        return 'RADIO';
      default:
        return field.type.toUpperCase();
    }
  };

  return (
    <Rnd
      style={{ zIndex: 10 }}
      size={{ width: field.width, height: field.height }}
      position={{ x: field.x, y: field.y }}
      onDragStop={(e, d) => {
        onUpdate(field.id, { x: d.x, y: d.y });
      }}
      onResizeStop={(e, direction, ref, delta, position) => {
        onUpdate(field.id, {
          width: parseInt(ref.style.width),
          height: parseInt(ref.style.height),
          x: position.x,
          y: position.y,
        });
      }}
      bounds="parent"
      minWidth={50}
      minHeight={30}
    >
      <div className={`${getFieldStyle()} w-full h-full relative group`}>
        {getFieldLabel()}
        <button
          onClick={() => onDelete(field.id)}
          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
        >
          ×
        </button>
      </div>
    </Rnd>
  );
}
