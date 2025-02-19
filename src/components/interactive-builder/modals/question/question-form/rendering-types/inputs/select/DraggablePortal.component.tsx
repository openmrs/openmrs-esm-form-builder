import type React from 'react';
import ReactDOM from 'react-dom';

interface DraggablePortalProps {
  children: React.ReactNode;
}

const DraggablePortal: React.FC<DraggablePortalProps> = ({ children }) => {
  return ReactDOM.createPortal(children, document.body);
};

export default DraggablePortal;
