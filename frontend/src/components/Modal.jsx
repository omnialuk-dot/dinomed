import "../styles/home.css";

export default function Modal({ open, title, children, onClose }) {
if (!open) return null;

const onBackdrop = (e) => {
if (e.target.classList.contains("backdrop")) onClose?.();
};

return (
<div className="backdrop" onMouseDown={onBackdrop}>
<div className="modal" role="dialog" aria-modal="true">
<div className="modalHead">
<div className="modalTitle">{title}</div>
<button className="modalClose" onClick={onClose}>Chiudi</button>
</div>
<div className="modalBody">{children}</div>
</div>
</div>
);
}