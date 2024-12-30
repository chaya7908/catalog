const MenuAction: React.FC<{
  text: string;
  icon: JSX.Element;
  isActive: boolean;
  onClick?: () => void;
  component?: JSX.Element
}> = ({ text, icon, isActive, onClick, component }) => {

  return (
    <div className={`action-item-container  ${isActive ? 'active' : ''}`}>
      <div className={`action-item ${isActive ? 'active' : ''}`} onClick={onClick}>
        <p className="text">{text}</p>
        <div className={`icon ${isActive ? 'zoom-out' : ''}`}>{icon}</div>
      </div>
      <div className="component-container">{component}</div>
    </div>
  );
};

export default MenuAction;