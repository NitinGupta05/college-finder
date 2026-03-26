// Enhanced Toast Notification System
class Toast {
  constructor() {
    this.container = null;
  }

  init() {
    if (document.getElementById('toast-container')) {
      this.container = document.getElementById('toast-container');
      return;
    }

    // Inject styles dynamically to avoid magic numbers and external dependencies
    const style = document.createElement('style');
    style.textContent = `
      #toast-container {
        position: fixed;
        top: 100px;
        right: 20px;
        z-index: 9999;
        display: flex;
        flex-direction: column;
        gap: 10px;
        pointer-events: none;
      }
      .toast {
        background: #fff;
        color: #333;
        padding: 12px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        display: flex;
        align-items: center;
        gap: 12px;
        min-width: 280px;
        pointer-events: auto;
        border-left: 4px solid #333;
        opacity: 0;
        transform: translateX(100%);
        animation: slideInRight 0.3s ease forwards;
      }
      .toast-success { border-left-color: #28a745; }
      .toast-error { border-left-color: #dc3545; }
      .toast-info { border-left-color: #17a2b8; }
      .toast-warning { border-left-color: #ffc107; }
      
      .toast.exiting {
        animation: slideOutRight 0.3s ease forwards;
      }

      @keyframes slideInRight {
        to { opacity: 1; transform: translateX(0); }
      }
      @keyframes slideOutRight {
        to { opacity: 0; transform: translateX(100%); }
      }
    `;
    document.head.appendChild(style);

    this.container = document.createElement('div');
    this.container.id = 'toast-container';
    document.body.appendChild(this.container);
  }

  show(message, type = 'success', duration = 4000) {
    if (!this.container) this.init();

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    // Safe DOM creation (Prevents XSS)
    const icons = {
      success: 'fas fa-check-circle',
      error: 'fas fa-exclamation-triangle',
      info: 'fas fa-info-circle'
    };

    const icon = document.createElement('i');
    icon.className = icons[type] || icons.info;
    icon.style.color = type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#17a2b8';
    
    const text = document.createElement('span');
    text.textContent = message;

    toast.appendChild(icon);
    toast.appendChild(text);
    
    this.container.appendChild(toast);
    
    setTimeout(() => {
      toast.classList.add('exiting');
      // Use event listener for cleanup to prevent race conditions
      toast.addEventListener('animationend', () => {
        if (toast.parentElement) toast.remove();
      });
    }, duration);
  }
}

// Types: success, error, info, warning
export default new Toast();
